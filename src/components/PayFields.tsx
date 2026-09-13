import type { CaseFile, Language } from '../types';
import { intakeCopy } from '../data/intakeCopy';
import { awardRates } from '../data/payRules';
import { Field } from './Intake';

/** Answers the pay rules engine needs: rate, hours, basis, award and superannuation. */
export default function PayFields({ language, caseFile, onChange }: { language: Language; caseFile: CaseFile; onChange: (file: CaseFile) => void }) {
  const copy = intakeCopy[language];
  const pay = caseFile.pay ?? {};
  const update = (patch: Partial<NonNullable<CaseFile['pay']>>) => onChange({ ...caseFile, pay: { ...pay, ...patch } });
  const numeric = (value: string) => (value === '' ? undefined : Number(value));

  return <>
    <div className="intake-field-grid">
      <Field label={copy.payAward}>
        <select value={pay.award ?? ''} onChange={event => update({ award: (event.target.value || undefined) as NonNullable<CaseFile['pay']>['award'] })}>
          <option value="">{copy.choose}</option>
          {Object.entries(awardRates).map(([key, rate]) => <option key={key} value={key}>{rate.name[language]}</option>)}
        </select>
      </Field>
      <Field label={copy.payBasis}>
        <select value={pay.employmentBasis ?? ''} onChange={event => update({ employmentBasis: (event.target.value || undefined) as NonNullable<CaseFile['pay']>['employmentBasis'] })}>
          <option value="">{copy.choose}</option>
          {Object.entries(copy.payBasisOptions).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
        </select>
      </Field>
      <Field label={copy.payRate}>
        <input type="number" min="0" max="1000" step="0.01" value={pay.hourlyRate ?? ''} placeholder={copy.payRatePlaceholder} onChange={event => update({ hourlyRate: numeric(event.target.value) })} />
      </Field>
      <Field label={copy.payHours}>
        <input type="number" min="0" max="168" step="0.5" value={pay.hoursPerWeek ?? ''} placeholder={copy.payHoursPlaceholder} onChange={event => update({ hoursPerWeek: numeric(event.target.value) })} />
      </Field>
      <Field label={copy.paySuper}>
        <select value={pay.superPaid ?? ''} onChange={event => update({ superPaid: (event.target.value || undefined) as NonNullable<CaseFile['pay']>['superPaid'] })}>
          <option value="">{copy.choose}</option>
          <option value="yes">{copy.yes}</option>
          <option value="no">{copy.no}</option>
          <option value="unknown">{copy.notSure}</option>
        </select>
      </Field>
    </div>
    <label className="intake-check"><input type="checkbox" checked={pay.paidCash === true} onChange={event => update({ paidCash: event.target.checked })} /><span>{copy.payCash}</span></label>
  </>;
}
