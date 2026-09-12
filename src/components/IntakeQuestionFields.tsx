import { Check, ChevronRight } from 'lucide-react';
import type { CaseFile, Language } from '../types';
import { intakeCopy } from '../data/intakeCopy';
import { EmployerFields, EvidenceFields, Field, SafeContactFields } from './Intake';

interface QuestionFieldsProps {
  step: number;
  language: Language;
  caseFile: CaseFile;
  onChange: (file: CaseFile) => void;
  narrativeLanguage: Language;
  onNarrativeChange: (value: string) => void;
}

/** The answer fields for one prepared question. Grouped pages render several of these together. */
export default function QuestionFields({ step, language, caseFile, onChange, narrativeLanguage, onNarrativeChange }: QuestionFieldsProps) {
  const copy = intakeCopy[language];
  const updateProfile = (patch: Partial<CaseFile['profile']>) => onChange({ ...caseFile, profile: { ...caseFile.profile, ...patch } });
  const updateEmergency = (patch: Partial<NonNullable<CaseFile['emergencyContact']>>) => onChange({ ...caseFile, emergencyContact: { ...caseFile.emergencyContact, ...patch } });

  if (step === 0) return <Field label={copy.answer}><textarea autoComplete="off" rows={6} value={caseFile.narrative[narrativeLanguage]} placeholder={copy.narrativePlaceholder} onChange={event => onNarrativeChange(event.target.value)} /></Field>;
  if (step === 1) return <div className="intake-field-stack"><Field label={copy.industry}><input value={caseFile.profile.industry ?? ''} placeholder={copy.industryPlaceholder} onChange={event => updateProfile({ industry: event.target.value })} /></Field><Field label={copy.role}><input value={caseFile.profile.role ?? ''} placeholder={copy.rolePlaceholder} onChange={event => updateProfile({ role: event.target.value })} /></Field></div>;
  if (step === 2) return <><div className="intake-option-buttons">{[true, false].map(value => <button key={String(value)} type="button" aria-pressed={caseFile.profile.stillEmployed === value} className={caseFile.profile.stillEmployed === value ? 'intake-option intake-selected' : 'intake-option'} onClick={() => updateProfile({ stillEmployed: caseFile.profile.stillEmployed === value ? undefined : value })}>{value ? copy.stillEmployed : copy.noLongerEmployed}{caseFile.profile.stillEmployed === value ? <Check size={17} /> : <ChevronRight size={17} />}</button>)}</div><Field label={copy.tenure}><input type="number" min="0" max="1000" value={caseFile.profile.tenureMonths ?? ''} placeholder={copy.tenurePlaceholder} onChange={event => updateProfile({ tenureMonths: event.target.value === '' ? undefined : Number(event.target.value) })} /></Field></>;
  if (step === 3) return <Field label={copy.visa}><select value={caseFile.profile.visaSubclass ?? ''} onChange={event => updateProfile({ visaSubclass: (event.target.value || undefined) as CaseFile['profile']['visaSubclass'] })}><option value="">{copy.choose}</option>{Object.entries(copy.visaOptions).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></Field>;
  if (step === 4) return <EvidenceFields language={language} caseFile={caseFile} onChange={onChange} />;
  if (step === 5) return <SafeContactFields language={language} caseFile={caseFile} onChange={onChange} />;
  if (step === 6) return <><div className="intake-field-stack"><Field label={copy.alternateName}><input value={caseFile.emergencyContact?.name ?? ''} onChange={event => updateEmergency({ name: event.target.value })} /></Field><Field label={copy.relationship}><input value={caseFile.emergencyContact?.relationship ?? ''} onChange={event => updateEmergency({ relationship: event.target.value })} /></Field><Field label={copy.phone}><input type="tel" value={caseFile.emergencyContact?.phone ?? ''} onChange={event => updateEmergency({ phone: event.target.value })} /></Field></div><label className="intake-check"><input type="checkbox" checked={caseFile.emergencyContact?.mayWeContact === true} onChange={event => updateEmergency({ mayWeContact: event.target.checked })} /><span>{copy.alternateConsent}</span></label></>;
  return <EmployerFields language={language} caseFile={caseFile} onChange={onChange} />;
}
