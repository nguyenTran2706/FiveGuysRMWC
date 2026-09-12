import { useState } from 'react';
import { Megaphone } from 'lucide-react';
import type { CaseFile, Language } from '../types';
import { archetypeLabels } from '../data/stories';
import { watchCopy } from '../data/watchCopy';
import { loadReports, normalizeEmployer, removeReport, saveReport } from '../data/employerReports';

/**
 * Opt-in that carries four fields from the draft to the community board: workplace name, suburb,
 * the categories the worker selected, and the month. The account, pay figures, visa and contact
 * details are never included — pay attached to a named workplace would identify the worker.
 */
export default function CommunityFlagOptIn({ language, caseFile }: { language: Language; caseFile: CaseFile }) {
  const copy = watchCopy[language];
  const employer = caseFile.employer?.name?.trim() ?? '';
  const suburb = caseFile.profile.suburb?.trim() || caseFile.employer?.address?.trim() || '';
  const patterns = caseFile.selfReported?.categories ?? [];
  const month = new Date().toISOString().slice(0, 7);
  const [added, setAdded] = useState(() => loadReports().some(report => normalizeEmployer(report.employer) === normalizeEmployer(employer) && report.month === month && employer !== ''));

  function toggle(checked: boolean) {
    if (checked) saveReport({ employer, suburb: suburb || undefined, patterns: [...patterns], month });
    else removeReport(employer, month);
    setAdded(checked);
  }

  return <section className="summary-consent summary-flag-optin">
    <h2><Megaphone size={19} />{copy.flagTitle}</h2>
    <p>{copy.flagIntro}</p>
    {!employer && <p className="summary-flag-blocked">{copy.flagNoEmployer}</p>}
    {employer && !patterns.length && <p className="summary-flag-blocked">{copy.flagNoPatterns}</p>}
    {employer && patterns.length > 0 && <>
      <div className="summary-flag-preview">
        <span className="intake-eyebrow">{copy.flagPreviewLabel}</span>
        <p><strong>{employer}</strong>{suburb && ` · ${suburb}`}</p>
        <p>{patterns.map(pattern => archetypeLabels[pattern][language]).join(' · ')}</p>
        <p className="watch-months">{copy.months}: {month}</p>
      </div>
      <label className="intake-check"><input type="checkbox" checked={added} onChange={event => toggle(event.target.checked)} /><span>{copy.flagCheckbox}</span></label>
      {added && <p className="summary-flag-added" role="status">{copy.flagAdded}</p>}
    </>}
    <p>{copy.flagPrototype}</p>
  </section>;
}
