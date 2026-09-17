import { useState } from 'react';
import { Megaphone } from 'lucide-react';
import type { CaseFile, Language } from '../types';
import { archetypeLabels } from '../data/stories';
import { watchCopy } from '../data/watchCopy';
import { industryKeys, loadReports, removeReport, reportKey, saveReport, type IndustryKey } from '../data/employerReports';
import { findOccupation, isIndustryCode, workFreeText, type IndustryCode } from '../data/occupations';
import { Field } from './Intake';

/** The board's buckets are narrower than ANZSIC (nail salons sit under "Other Services"), so the job decides first. */
const boardBucketByJob: Record<string, IndustryKey> = {
  nail_technician: 'nail_beauty', beauty_therapist: 'nail_beauty', hairdresser: 'nail_beauty', massage_therapist: 'nail_beauty',
  fast_food_crew: 'fast_food',
  commercial_cleaner: 'cleaning', domestic_cleaner: 'cleaning', hotel_housekeeper: 'cleaning',
  delivery_rider: 'delivery', delivery_driver: 'delivery', rideshare_driver: 'delivery', truck_driver: 'delivery',
  aged_care_worker: 'aged_care', care_team_leader: 'aged_care', home_care_worker: 'aged_care', assistant_in_nursing: 'aged_care',
  retail_assistant: 'grocery_retail', cashier: 'grocery_retail', shelf_filler: 'grocery_retail', grocery_store_worker: 'grocery_retail',
  hotel_receptionist: 'other',
};
const boardBucketByIndustry: Partial<Record<IndustryCode, IndustryKey>> = {
  accommodation_food: 'restaurant_cafe', retail_trade: 'grocery_retail', construction: 'construction',
};

/** Words for the worker's own "Other" answer, or free text from an older draft. */
const industryHints: Array<[IndustryKey, RegExp]> = [
  ['nail_beauty', /nail|mong|móng|beauty|spa|tham my|thẩm mỹ|salon|toc|tóc/i],
  ['fast_food', /fast food|thuc an nhanh|thức ăn nhanh|kfc|mcdonald|hungry/i],
  ['restaurant_cafe', /restaurant|nha hang|nhà hàng|cafe|ca phe|cà phê|kitchen|bep|bếp|pho|phở|bakery|banh|bánh|waiter|phuc vu|phục vụ/i],
  ['grocery_retail', /retail|ban le|bán lẻ|shop|sieu thi|siêu thị|grocery|woolworth|coles|cashier|thu ngan|thu ngân/i],
  ['cleaning', /clean|ve sinh|vệ sinh|don dep|dọn dẹp|housekeep/i],
  ['delivery', /deliver|giao hang|giao hàng|uber|driver|tai xe|tài xế|rider/i],
  ['construction', /construct|xay dung|xây dựng|builder|labourer|tho han|thợ hàn|son|sơn/i],
  ['aged_care', /aged care|cham soc|chăm sóc|disability|nurse|dieu duong|điều dưỡng/i],
];

/** Best guess of the board's bucket from the draft. The worker can change it before adding anything. */
function guessIndustry(profile: CaseFile['profile']): IndustryKey {
  const byJob = findOccupation(profile.role) && boardBucketByJob[profile.role!];
  if (byJob) return byJob;
  const byIndustry = isIndustryCode(profile.industry) ? boardBucketByIndustry[profile.industry] : undefined;
  if (byIndustry) return byIndustry;
  const ownWords = workFreeText(profile).join(' ');
  return industryHints.find(([, pattern]) => pattern.test(ownWords))?.[0] ?? 'other';
}

/**
 * Opt-in that carries four fields from the draft to the community board: industry, suburb, the
 * categories the worker selected, and the month. No business name, no free text, no pay figures,
 * no visa and no contact details — those would identify the worker or expose RMWC to a claim.
 */
export default function CommunityFlagOptIn({ language, caseFile }: { language: Language; caseFile: CaseFile }) {
  const copy = watchCopy[language];
  const patterns = caseFile.selfReported?.categories ?? [];
  const month = new Date().toISOString().slice(0, 7);
  const [industry, setIndustry] = useState<IndustryKey>(() => guessIndustry(caseFile.profile));
  const [suburb, setSuburb] = useState(() => caseFile.profile.suburb?.trim() ?? '');
  const [added, setAdded] = useState(false);

  function toggle(checked: boolean) {
    if (checked && !suburb.trim()) return;
    if (checked) saveReport({ industry, suburb: suburb.trim().slice(0, 60), patterns: [...patterns], month });
    else removeReport(industry, suburb.trim(), month);
    setAdded(checked);
  }

  /** Editing the entry after it was added keeps the board in step with what the checkbox shows. */
  function revise(next: { industry?: IndustryKey; suburb?: string }) {
    if (added) removeReport(industry, suburb.trim(), month);
    setAdded(false);
    if (next.industry) setIndustry(next.industry);
    if (next.suburb !== undefined) setSuburb(next.suburb);
  }

  const stored = loadReports().some(report => reportKey(report.industry, report.suburb) === reportKey(industry, suburb.trim()) && report.month === month);

  return <section className="summary-consent summary-flag-optin">
    <h2><Megaphone size={19} />{copy.flagTitle}</h2>
    <p>{copy.flagIntro}</p>
    {!patterns.length ? <p className="summary-flag-blocked">{copy.flagNoPatterns}</p> : <>
      <div className="summary-flag-fields">
        <Field label={copy.industryLabel}>
          <select value={industry} onChange={event => revise({ industry: event.target.value as IndustryKey })}>
            {industryKeys.map(key => <option key={key} value={key}>{copy.industries[key]}</option>)}
          </select>
        </Field>
        <Field label={copy.suburbLabel}>
          <input value={suburb} placeholder={copy.suburbPlaceholder} onChange={event => revise({ suburb: event.target.value })} />
        </Field>
      </div>
      <div className="summary-flag-preview">
        <span className="intake-eyebrow">{copy.flagPreviewLabel}</span>
        <p><strong>{copy.industries[industry]}</strong>{suburb.trim() && ` · ${suburb.trim()}`}</p>
        <p>{patterns.map(pattern => archetypeLabels[pattern][language]).join(' · ')}</p>
        <p className="watch-months">{copy.months}: {month}</p>
      </div>
      {suburb.trim() ? <label className="intake-check"><input type="checkbox" checked={added && stored} onChange={event => toggle(event.target.checked)} /><span>{copy.flagCheckbox}</span></label>
        : <p className="summary-flag-blocked">{copy.needSuburb}</p>}
      {added && stored && <p className="summary-flag-added" role="status">{copy.flagAdded}</p>}
    </>}
    <p>{copy.flagPrototype}</p>
  </section>;
}
