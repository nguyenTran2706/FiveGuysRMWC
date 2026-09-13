import type { Archetype, CaseFile, Language } from '../types';
import { intakeCopy } from '../data/intakeCopy';
import { archetypeLabels } from '../data/stories';
import { selfReportCategories } from '../data/selfReport';
import { Field } from './Intake';

/** The worker declares their own categories, and says why in their own words. */
export default function SelfReportFields({ language, caseFile, onChange }: { language: Language; caseFile: CaseFile; onChange: (file: CaseFile) => void }) {
  const copy = intakeCopy[language];
  const selfReported = caseFile.selfReported ?? {};
  const selected = selfReported.categories ?? [];
  const update = (patch: Partial<NonNullable<CaseFile['selfReported']>>) => onChange({ ...caseFile, selfReported: { ...selfReported, ...patch } });

  function toggle(archetype: Archetype) {
    const next = selected.includes(archetype) ? selected.filter(item => item !== archetype) : [...selected, archetype];
    update({ categories: next, preferNotSay: next.length ? false : selfReported.preferNotSay });
  }

  return <div className="intake-selfreport">
    {selfReportCategories.map(archetype => <div className="intake-selfreport-item" key={archetype}>
      <label className="intake-check"><input type="checkbox" checked={selected.includes(archetype)} onChange={() => toggle(archetype)} /><span>{archetypeLabels[archetype][language]}</span></label>
      {selected.includes(archetype) && <div className="intake-selfreport-reason">
        <Field label={copy.selfReportReason}>
          <textarea rows={3} lang={language} value={selfReported.reasons?.[archetype] ?? ''} placeholder={copy.selfReportReasonPlaceholder} onChange={event => update({ reasons: { ...selfReported.reasons, [archetype]: event.target.value } })} />
        </Field>
      </div>}
    </div>)}
    <label className="intake-check"><input type="checkbox" checked={selfReported.preferNotSay === true} onChange={event => update({ preferNotSay: event.target.checked, categories: event.target.checked ? [] : selected })} /><span>{copy.selfReportPreferNotSay}</span></label>
    <Field label={copy.selfReportOther}>
      <input lang={language} value={selfReported.other ?? ''} placeholder={copy.selfReportOtherPlaceholder} onChange={event => update({ other: event.target.value })} />
    </Field>
  </div>;
}
