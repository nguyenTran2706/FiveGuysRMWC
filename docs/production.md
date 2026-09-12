# Production integration notes

The playable browser experience runs without credentials. The default contact journey hands off to RMWC's existing legal-help page. No submissions have been deployed or sent, and no real caseworker assignment has been performed.

## Supabase scaffold

`supabase/migrations/202609120001_case_files.sql` creates `case_files`, `case_events`, `caseworkers` and `anon_stats`. The full case document, including all optional profile, detail, evidence, narrative, consent and safety fields, lives in JSONB. Indexed workflow columns support a future inbox. Optional `contact` and `employer` blocks extend the brief's schema, which otherwise lacks the person's actual contact details.

RLS is enabled on every table. Anonymous users have no direct table access or RPC access. Authenticated staff see only cases assigned to them; active supervisors can see the inbox. Staff roles must be provisioned by an administrator, not through public registration or editable user metadata. Status changes use `transition_case`, with an audit event in the same transaction. No staff console UI, document uploads, PDF referral service or notifications are implemented.

`submit-case` accepts a full CaseFile JSON request, verifies explicit sharing consent and a recent consent timestamp, enforces field types and size limits, and strips client-supplied identity, workflow state and assignment. Its server-only service credential calls `submit_case_internal`. That function stores the case and audit events atomically. It assigns a real, active worker matching the case language when one exists; otherwise it honestly returns `submitted` without a named assignment. No email, Slack or employer contact occurs.

The function returns `{ reference, status, assignment? }`. This receipt confirms database storage only; it is not a promise that a caseworker has read a case or will respond within a particular time. If a connection is interrupted, delivery may be uncertain. Implement an opaque per-submission idempotency token and receipt reconciliation before exposing retries in a production client.

## Configuration before enabling a backend

1. Confirm with RMWC whether the existing enquiry form remains the sole intake system. Keep the current handoff if so; do not create a second inbox without their agreement.
2. Provision an approved Supabase project, apply the migration in staging, and create genuine Auth users and corresponding caseworker records. Test anonymous, inactive, assigned and supervisor roles using separate sessions.
3. Put the endpoint behind durable rate limiting and abuse protection. An exact CORS origin allowlist limits browser access, but is not authentication and does not stop scripted requests. Avoid retaining raw IP addresses with cases; apply short-lived gateway rate limits separately from case records. Do not trust an arbitrary client header as proof of gateway enforcement.
4. Set server secrets `ALLOWED_ORIGINS` to exact approved HTTPS origins and `SUBMISSIONS_ENABLED=true` only after review. `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` belong only in the Edge Function runtime. Never put a secret/service-role key in a `VITE_` variable.
5. Deploy the function with the supplied `verify_jwt=false` setting because visitors do not need an account. The handler remains disabled without its explicit server setting and origin configuration. Read the [Supabase function authentication documentation](https://supabase.com/docs/guides/functions/auth) alongside its [RLS documentation](https://supabase.com/docs/guides/database/postgres/row-level-security).
6. Wire the browser send action to the reviewed endpoint only if the backend is adopted. `.env.example` reserves `VITE_CASE_SUBMIT_URL` for that endpoint; environment configuration alone does not constitute a consented transfer. Keep all draft edits in memory, show the complete bilingual file, request fresh explicit consent, and send only after the person presses Send.

The migration deliberately provides no anonymous read-by-reference endpoint. Do not treat knowledge of a reference as authorization to read a case. Add authenticated staff access, deliberate reassignment, safe-contact banners and an approved attachment pipeline before opening a staff service. Uploads need private storage policies, file-type/size checks, malware handling and individually authorized download URLs.

## Privacy and aggregates

Statistics are incremented only when the person separately opts in. `anon_stats` holds aggregate cells rather than case IDs or narratives. Free-text values are mapped to a short allowlist or `other_or_not_shared`; small cells below five are hidden from supervisors through RLS. This is a starting safeguard, not proof of anonymity: RMWC must review combinations, repeated reports, export policy and small-population risks before using them for research. Backend administrators can still access the underlying aggregate table.

Set retention periods, deletion/access procedures, access auditing, staff MFA, backup handling and approved hosting/data regions before real use. Configure infrastructure logs so request bodies and contacts are never logged. There are no trackers, remote AI requests or automatic messages in this implementation.

Quick exit can clear application memory and replace the current navigation entry. It cannot clear browser history from earlier visits, a device's monitoring software, hosting/network records, clipboard contents or downloaded summaries. Test restored-page/back-forward cache behavior in supported browsers and present that limitation honestly.

## Content and accessibility review

The scenes are generated illustrations of fictional characters. Their epilogues are fictional outcomes, not predictions of real claims. Have RMWC and Vietnamese-speaking workers review dialogue, translations, cultural framing and the separation of general information from legal advice. A native speaker has not yet reviewed this build.

The guided intake is local scripted logic. Any future bilingual model service needs an approved server-only integration, consent and data-handling decisions, structured schema validation, escalation before and after model output, editable bilingual summaries and honest disclosure. Do not label local keyword matching as AI translation or reliable crisis assessment.

Browser speech depends on device voices; Vietnamese is not guaranteed, and some system voices may use remote processing. Professionally reviewed, locally hosted recorded dialogue is required for dependable literacy access. Provide transcripts and avoid playing entered personal text through a remote speech service without the person's informed choice. Measure first-load transfer size on a production build and representative low-end Android devices; lazy-loaded art, reduced motion, visible focus and contrast should be assessed alongside screen-reader testing.

The modern-slavery reporting contact can be configured as an optional AFP reporting action at **131 237**, verified against the [Australian Anti-Slavery Commissioner](https://www.antislaverycommissioner.gov.au/find-help-and-support/report-suspected-modern-slavery). It is a reporting service, not an automatic escalation destination. Immediate emergency options remain visible without sending the person's information anywhere.
