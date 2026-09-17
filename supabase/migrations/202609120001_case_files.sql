begin;

create table public.caseworkers (
  id uuid primary key references auth.users(id) on delete restrict,
  display_name text not null check (length(display_name) between 1 and 200),
  languages text[] not null default array['en']::text[] check (languages <@ array['vi', 'en']::text[] and cardinality(languages) > 0),
  role text not null default 'caseworker' check (role in ('caseworker', 'supervisor')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.case_files (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  language text not null check (language in ('vi', 'en')),
  source text not null check (source in ('street', 'agent')),
  status text not null check (status in ('submitted', 'assigned', 'contacted', 'closed')),
  readiness text not null check (readiness in ('ready_now', 'not_yet', 'information_only')),
  assigned_caseworker_id uuid references public.caseworkers(id) on delete restrict,
  document jsonb not null check (jsonb_typeof(document) = 'object'),
  constraint sharing_consent_required check (document #> '{consent,shareWithRMWC}' is not distinct from 'true'::jsonb),
  constraint no_draft_storage check (document ->> 'status' is not distinct from status)
);
create index case_files_assignee_created on public.case_files (assigned_caseworker_id, created_at desc);
create index case_files_status_created on public.case_files (status, created_at desc);

create table public.case_events (
  id bigint generated always as identity primary key,
  case_file_id uuid not null references public.case_files(id) on delete cascade,
  created_at timestamptz not null default now(),
  actor_caseworker_id uuid references public.caseworkers(id) on delete set null,
  event_type text not null check (event_type in ('submitted', 'assigned', 'contacted', 'closed')),
  -- Event metadata deliberately excludes narratives, contact details and attachments.
  metadata jsonb not null default '{}'::jsonb
);
create index case_events_case_created on public.case_events (case_file_id, created_at);

create table public.anon_stats (
  month date not null,
  archetype text not null check (archetype in ('underpayment', 'unfair_dismissal', 'sham_contracting', 'workplace_injury', 'discrimination', 'sexual_harassment', 'bullying')),
  industry text not null,
  visa_type text not null,
  suburb text not null,
  count bigint not null default 1 check (count > 0),
  primary key (month, archetype, industry, visa_type, suburb)
);

alter table public.caseworkers enable row level security;
alter table public.case_files enable row level security;
alter table public.case_events enable row level security;
alter table public.anon_stats enable row level security;

-- No anonymous table reads or direct writes. No public intake-by-ID lookup exists.
revoke all on public.caseworkers, public.case_files, public.case_events, public.anon_stats from anon, authenticated;
grant select on public.caseworkers, public.case_files, public.case_events, public.anon_stats to authenticated;
grant all on public.caseworkers, public.case_files, public.case_events, public.anon_stats to service_role;
grant usage, select on sequence public.case_events_id_seq to service_role;

create function public.is_active_caseworker() returns boolean
language sql stable security definer set search_path = ''
as $$ select exists (select 1 from public.caseworkers where id = auth.uid() and active); $$;
create function public.is_case_supervisor() returns boolean
language sql stable security definer set search_path = ''
as $$ select exists (select 1 from public.caseworkers where id = auth.uid() and active and role = 'supervisor'); $$;
revoke all on function public.is_active_caseworker(), public.is_case_supervisor() from public, anon;
grant execute on function public.is_active_caseworker(), public.is_case_supervisor() to authenticated;

create policy caseworkers_read on public.caseworkers for select to authenticated
  using ((id = auth.uid() and active) or public.is_case_supervisor());
create policy case_files_read on public.case_files for select to authenticated
  using (public.is_case_supervisor() or (assigned_caseworker_id = auth.uid() and public.is_active_caseworker()));
create policy case_events_read on public.case_events for select to authenticated
  using (exists (select 1 from public.case_files c where c.id = case_file_id));
-- Only supervisors see aggregate cells, and cells smaller than five are suppressed.
create policy anon_stats_read on public.anon_stats for select to authenticated
  using (public.is_case_supervisor() and count >= 5);

create function public.submit_case_internal(p_document jsonb) returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  v_id uuid := gen_random_uuid();
  v_reference text := 'RMWC-' || upper(replace(gen_random_uuid()::text, '-', ''));
  v_now timestamptz := now();
  v_worker public.caseworkers%rowtype;
  v_status text := 'submitted';
  v_document jsonb;
  v_assignment jsonb;
  v_flag jsonb;
  v_industry text;
  v_visa text;
  v_suburb text;
begin
  if jsonb_typeof(p_document) is distinct from 'object'
    or p_document #> '{consent,shareWithRMWC}' is distinct from 'true'::jsonb then
    raise exception 'Sharing consent is required';
  end if;
  if p_document ->> 'language' not in ('vi', 'en') or p_document ->> 'source' not in ('street', 'agent') then
    raise exception 'Invalid document';
  end if;
  -- Real, active, language-matched staff only. An empty roster leaves a submitted case unassigned.
  select cw.* into v_worker from public.caseworkers cw
  where cw.active and p_document ->> 'language' = any(cw.languages)
  order by (select count(*) from public.case_files cf where cf.assigned_caseworker_id = cw.id and cf.status <> 'closed'), cw.created_at, cw.id
  limit 1;
  if v_worker.id is not null then
    v_status := 'assigned';
    v_assignment := jsonb_build_object('caseworkerId', v_worker.id, 'caseworkerName', v_worker.display_name, 'assignedAtISO', v_now);
  end if;
  v_document := (p_document - 'id' - 'createdAt' - 'status' - 'assignment') || jsonb_build_object('id', v_reference, 'createdAt', v_now, 'status', v_status);
  if v_assignment is not null then v_document := v_document || jsonb_build_object('assignment', v_assignment); end if;
  insert into public.case_files (id, reference, created_at, updated_at, language, source, status, readiness, assigned_caseworker_id, document)
  values (v_id, v_reference, v_now, v_now, p_document ->> 'language', p_document ->> 'source', v_status, p_document ->> 'readiness', v_worker.id, v_document);
  insert into public.case_events (case_file_id, event_type) values (v_id, 'submitted');
  if v_worker.id is not null then
    insert into public.case_events (case_file_id, event_type, metadata) values (v_id, 'assigned', jsonb_build_object('caseworkerId', v_worker.id));
  end if;
  if p_document #> '{consent,storeAnonymisedStats}' = 'true'::jsonb then
    -- Never promote user-entered free text into an ostensibly anonymous aggregate.
    -- Industry is an ANZSIC division key from src/data/occupations.ts; 'other' and older free text are not aggregated.
    v_industry := coalesce(p_document #>> '{profile,industry}', '');
    if v_industry not in ('agriculture_forestry_fishing', 'mining', 'manufacturing', 'electricity_gas_water_waste', 'construction',
      'wholesale_trade', 'retail_trade', 'accommodation_food', 'transport_postal_warehousing', 'information_media_telecommunications',
      'financial_insurance', 'rental_hiring_real_estate', 'professional_scientific_technical', 'administrative_support',
      'public_administration_safety', 'education_training', 'health_care_social_assistance', 'arts_recreation', 'other_services')
      then v_industry := 'other_or_not_shared'; end if;
    v_visa := coalesce(p_document #>> '{profile,visaSubclass}', 'prefer_not_say');
    if v_visa not in ('500', '482', '485', '417', '462', 'PALM', 'bridging', 'PR', 'citizen', 'other', 'prefer_not_say') then v_visa := 'prefer_not_say'; end if;
    v_suburb := lower(trim(coalesce(p_document #>> '{profile,suburb}', '')));
    if v_suburb not in ('cabramatta', 'bankstown', 'fairfield', 'liverpool', 'parramatta', 'sydney') then v_suburb := 'other_or_not_shared'; end if;
    for v_flag in select distinct value -> 'archetype' from jsonb_array_elements(p_document -> 'flags') loop
      insert into public.anon_stats (month, archetype, industry, visa_type, suburb)
      values (date_trunc('month', v_now)::date, v_flag #>> '{}', v_industry, v_visa, v_suburb)
      on conflict (month, archetype, industry, visa_type, suburb) do update set count = public.anon_stats.count + 1;
    end loop;
  end if;
  return jsonb_strip_nulls(jsonb_build_object('reference', v_reference, 'status', v_status, 'assignment', v_assignment));
end;
$$;
revoke all on function public.submit_case_internal(jsonb) from public, anon, authenticated;
grant execute on function public.submit_case_internal(jsonb) to service_role;

create function public.transition_case(p_case_id uuid, p_status text) returns void
language plpgsql security definer set search_path = ''
as $$
declare v_case public.case_files%rowtype;
begin
  select * into v_case from public.case_files where id = p_case_id for update;
  if v_case.id is null or not coalesce(public.is_case_supervisor() or (v_case.assigned_caseworker_id = auth.uid() and public.is_active_caseworker()), false) then
    raise exception 'Not permitted';
  end if;
  if not ((v_case.status = 'assigned' and p_status = 'contacted') or (v_case.status in ('submitted', 'assigned', 'contacted') and p_status = 'closed')) then
    raise exception 'Invalid status transition';
  end if;
  update public.case_files set status = p_status, updated_at = now(), document = jsonb_set(document, '{status}', to_jsonb(p_status)) where id = p_case_id;
  insert into public.case_events(case_file_id, actor_caseworker_id, event_type) values (p_case_id, auth.uid(), p_status);
end;
$$;
revoke all on function public.transition_case(uuid, text) from public, anon;
grant execute on function public.transition_case(uuid, text) to authenticated;

commit;
