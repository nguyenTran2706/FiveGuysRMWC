import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, ChevronDown, Copy, Download, ExternalLink, FileJson, FileText, LockKeyhole, MessageCircle, Phone, Share2, ShieldCheck } from 'lucide-react';
import type { CaseFile, Language } from '../types';
import { archetypeLabels, legalNotes } from '../data/stories';
import { intakeCopy, RMWC_CLINIC_URL } from '../data/intakeCopy';
import { CrisisOptions, EmployerFields, EvidenceFields, Field, SafeContactFields, needsImmediateSupport, type CasePageProps } from './Intake';
import '../intake.css';

type Validator = (value: unknown) => boolean;
const string: Validator = value => typeof value === 'string';
const boolean: Validator = value => typeof value === 'boolean';
const number: Validator = value => typeof value === 'number' && Number.isFinite(value) && value >= 0;
const oneOf = (...values: string[]): Validator => value => typeof value === 'string' && values.includes(value);
const list = (validator: Validator): Validator => value => Array.isArray(value) && value.every(validator);
function shape(fields: Record<string, Validator>, required: string[] = []): Validator {
  return value => {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
    const object = value as Record<string, unknown>;
    return required.every(key => Object.prototype.hasOwnProperty.call(object, key)) && Object.entries(object).every(([key, item]) => Object.prototype.hasOwnProperty.call(fields, key) && fields[key](item));
  };
}
const visas = ['500', '482', '485', '417', '462', 'PALM', 'bridging', 'PR', 'citizen', 'other', 'prefer_not_say'];
const archetypes = ['underpayment', 'unfair_dismissal', 'sham_contracting', 'workplace_injury', 'discrimination', 'sexual_harassment', 'bullying'];
const yesNoUnknown = oneOf('yes', 'no', 'unknown');
const caseValidator = shape({
  id: string, createdAt: value => string(value) && !Number.isNaN(Date.parse(value as string)), language: oneOf('vi', 'en'), source: oneOf('street', 'agent'), status: oneOf('draft'),
  profile: shape({ visaSubclass: oneOf(...visas), industry: string, role: string, tenureMonths: number, stillEmployed: boolean, employerSizeUnder15: boolean, suburb: string, ageBand: string }),
  flags: list(shape({ archetype: oneOf(...archetypes), confidence: oneOf('strong', 'possible'), signals: list(string), sourceNpc: string }, ['archetype', 'confidence', 'signals'])),
  detail: shape({
    underpayment: shape({ rateOrCashPerShift: string, paidCash: boolean, payslips: oneOf('always', 'sometimes', 'never'), hoursBand: string, unpaidTrial: boolean, unpaidTimeAroundShift: boolean, deductions: list(string), superPaid: yesNoUnknown, penaltyRates: yesNoUnknown }),
    shamContracting: shape({ toldToGetABN: boolean, whoSetsHours: string, ownTools: boolean, canSendSubstitute: boolean, invoices: boolean, worksForOthers: boolean }),
    workplaceInjury: shape({ what: string, whenISO: string, reportedTo: string, sawDoctor: boolean, workersCompLodged: boolean, paidWhileOff: boolean, pressuredNotToReport: boolean, hoursCutSince: boolean }),
    dismissal: shape({ howItEnded: oneOf('told_to_go', 'hours_cut_to_zero', 'forced_resign', 'other'), reasonGiven: string, inWriting: boolean, whatHappenedBefore: string }),
    discrimination: shape({ attribute: string, whatChanged: string, othersTreatedDifferently: boolean }),
    harassment: shape({ whatHappened: string, byWhom: oneOf('employer', 'coworker', 'customer', 'other'), ongoing: boolean, witnesses: boolean, reportedToAnyone: boolean }),
    bullying: shape({ behaviour: string, repeated: boolean, byWhom: string, witnesses: boolean }),
  }),
  narrative: shape({ vi: string, en: string }, ['vi', 'en']),
  evidenceHeld: shape({ payslips: boolean, rosters: boolean, bankStatements: boolean, messagesFromEmployer: boolean, photos: boolean, witnessNames: boolean, contract: boolean, notes: string }),
  othersAffected: boolean, readiness: oneOf('ready_now', 'not_yet', 'information_only'),
  contactSafety: shape({ preferredChannel: oneOf('phone', 'sms', 'email', 'zalo', 'messenger'), safeToCall: boolean, safeToLeaveVoicemail: boolean, safeToEmail: boolean, bestTimeOfDay: string, notes: string }),
  emergencyContact: shape({ name: string, relationship: string, phone: string, mayWeContact: boolean, language: oneOf('vi', 'en', 'other') }),
  contact: shape({ name: string, phone: string, email: string }), employer: shape({ name: string, address: string }),
  consent: shape({ shareWithRMWC: boolean, storeAnonymisedStats: boolean, timestampISO: string }, ['shareWithRMWC', 'storeAnonymisedStats', 'timestampISO']),
  assignment: shape({ caseworkerId: string, caseworkerName: string, assignedAtISO: string }),
}, ['id', 'createdAt', 'language', 'source', 'status', 'profile', 'flags', 'detail', 'narrative', 'evidenceHeld', 'readiness', 'contactSafety', 'consent']);

export function validateCaseFile(value: unknown): value is CaseFile { return caseValidator(value); }

export function caseFacts(file: CaseFile, language: Language): Array<[string, string]> {
  const copy = intakeCopy[language];
  return [
    [copy.role, file.profile.role ?? copy.notProvided],
    [copy.industry, file.profile.industry ?? copy.notProvided],
    [copy.workplace, file.profile.stillEmployed === undefined ? copy.notProvided : file.profile.stillEmployed ? copy.stillEmployed : copy.noLongerEmployed],
    [copy.tenure, file.profile.tenureMonths === undefined ? copy.notProvided : `${file.profile.tenureMonths} ${copy.months}`],
    [copy.visa, file.profile.visaSubclass ? copy.visaOptions[file.profile.visaSubclass] : copy.notProvided],
  ];
}

export function plainSummary(file: CaseFile, language: Language): string {
  const copy = intakeCopy[language];
  const evidence = Object.entries(copy.evidence).filter(([key]) => file.evidenceHeld[key as keyof CaseFile['evidenceHeld']] === true).map(([, label]) => label).join(', ');
  return [
    copy.draft, `${copy.reference}: ${file.id}`, '', copy.factsTitle,
    ...caseFacts(file, language).map(([label, value]) => `${label}: ${value}`), '', copy.themesTitle,
    ...file.flags.map(flag => `${archetypeLabels[flag.archetype][language]} (${flag.confidence === 'strong' ? copy.strong : copy.possible}): ${flag.signals.join('; ')}`),
    '', copy.bilingualTitle, copy.bilingualNote, `${copy.viNarrative}:\n${file.narrative.vi || copy.translationMissing}`, `${copy.enNarrative}:\n${file.narrative.en || copy.translationMissing}`,
    '', `${copy.evidenceTitle}: ${evidence || copy.notProvided}`, file.evidenceHeld.notes ?? '', '', copy.safeContactTitle,
    `${copy.channel}: ${file.contactSafety.preferredChannel ? copy.channels[file.contactSafety.preferredChannel] : copy.notProvided}`,
    `${copy.phone}: ${file.contact?.phone || copy.notProvided}`, `Email: ${file.contact?.email || copy.notProvided}`,
    `${copy.safeToCall}: ${file.contactSafety.safeToCall === undefined ? copy.notProvided : file.contactSafety.safeToCall ? copy.yes : copy.no}`,
    `${copy.safeVoicemail}: ${file.contactSafety.safeToLeaveVoicemail === undefined ? copy.notProvided : file.contactSafety.safeToLeaveVoicemail ? copy.yes : copy.no}`,
    `${copy.safeEmail}: ${file.contactSafety.safeToEmail === undefined ? copy.notProvided : file.contactSafety.safeToEmail ? copy.yes : copy.no}`,
    `${copy.bestTime}: ${file.contactSafety.bestTimeOfDay || copy.notProvided}`, `${copy.safetyNotes}: ${file.contactSafety.notes || copy.notProvided}`,
    '', `${copy.employerName}: ${file.employer?.name || copy.notProvided}`, `${copy.employerAddress}: ${file.employer?.address || copy.notProvided}`,
    '', copy.handoff, copy.disclaimer,
  ].join('\n');
}

function download(value: string, filename: string, type: string) {
  const url = URL.createObjectURL(new Blob([value], { type }));
  const anchor = document.createElement('a');
  anchor.href = url; anchor.download = filename;
  document.body.appendChild(anchor); anchor.click(); anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function Summary({ language, caseFile, onChange, onBack }: CasePageProps) {
  const copy = intakeCopy[language];
  const [jsonDraft, setJsonDraft] = useState(() => JSON.stringify(caseFile, null, 2));
  const [jsonDirty, setJsonDirty] = useState(false);
  const [jsonError, setJsonError] = useState(false);
  const [notice, setNotice] = useState<'downloaded' | 'shared' | 'fileApplied' | null>(null);
  const [shareUrl, setShareUrl] = useState('');
  useEffect(() => { if (!jsonDirty) setJsonDraft(JSON.stringify(caseFile, null, 2)); }, [caseFile, jsonDirty]);
  const rankedFlags = [...caseFile.flags].sort((a, b) => Number(b.confidence === 'strong') - Number(a.confidence === 'strong'));
  const urgent = needsImmediateSupport([caseFile.narrative.vi, caseFile.narrative.en, caseFile.contactSafety.notes, ...Object.values(caseFile.detail).flatMap(detail => Object.values(detail).filter(value => typeof value === 'string'))].filter(Boolean).join('\n'));
  function applyJson() {
    try {
      if (jsonDraft.length > 200000) throw new Error('size');
      const value: unknown = JSON.parse(jsonDraft);
      if (!validateCaseFile(value)) throw new Error('schema');
      onChange({ ...value, status: 'draft', assignment: undefined }); setJsonDirty(false); setJsonError(false); setNotice('fileApplied');
    } catch { setJsonError(true); }
  }
  function saveDraft() {
    download(JSON.stringify(caseFile, null, 2), `${caseFile.id}.json`, 'application/json;charset=utf-8');
    setNotice('downloaded');
  }
  function saveText() {
    download(`${plainSummary(caseFile, 'vi')}\n\n${'—'.repeat(40)}\n\n${plainSummary(caseFile, 'en')}`, `${caseFile.id}-summary.txt`, 'text/plain;charset=utf-8');
    setNotice('downloaded');
  }
  async function shareApp() {
    const appUrl = new URL('./', window.location.href);
    appUrl.search = ''; appUrl.hash = '';
    const url = appUrl.href;
    try {
      if (navigator.share) { await navigator.share({ title: copy.shareAppTitle, text: copy.shareAppText, url }); return; }
      await navigator.clipboard.writeText(url); setNotice('shared');
    } catch (error) { if (!(error instanceof DOMException && error.name === 'AbortError')) setShareUrl(url); }
  }
  function consent(key: 'shareWithRMWC' | 'storeAnonymisedStats', value: boolean) {
    onChange({ ...caseFile, consent: { ...caseFile.consent, [key]: value, timestampISO: new Date().toISOString() } });
  }

  return <section className="summary-page">
    <div className="intake-topline"><button className="intake-back" onClick={onBack}><ArrowLeft size={16} />{copy.back}</button><span className="intake-private"><LockKeyhole size={13} />{copy.draft}</span></div>
    <header className="summary-heading"><span className="intake-eyebrow">{copy.summaryEyebrow}</span><h1>{copy.summaryTitle}</h1><p>{copy.summaryIntro}</p><span className="summary-reference">{copy.reference} · {caseFile.id}</span></header>
    {urgent && <CrisisOptions language={language} />}
    <section className="summary-section"><div className="summary-section-heading"><MessageCircle size={20} /><div><h2>{copy.themesTitle}</h2><p>{copy.themesNote}</p></div></div>{rankedFlags.length ? <div className="summary-flags">{rankedFlags.map((flag, index) => <article className="summary-flag" key={`${flag.archetype}-${index}`}><div className="summary-flag-title"><h3>{archetypeLabels[flag.archetype][language]}</h3><span>{flag.confidence === 'strong' ? copy.strong : copy.possible}</span></div><p>{legalNotes[flag.archetype][language]}</p>{flag.signals.length > 0 && <blockquote>{flag.signals.join(' · ')}</blockquote>}</article>)}</div> : <p className="summary-empty">{copy.noFlags}</p>}</section>
    <section className="summary-section"><div className="summary-section-heading"><FileText size={20} /><div><h2>{copy.bilingualTitle}</h2><p>{copy.bilingualNote}</p></div></div><div className="summary-language-grid">{(['vi', 'en'] as Language[]).map(lang => <div className="summary-language-panel" key={lang}><span className="summary-language-label">{lang === 'vi' ? 'TIẾNG VIỆT' : 'ENGLISH'}</span><dl className="summary-facts">{caseFacts(caseFile, lang).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl><Field label={lang === 'vi' ? copy.viNarrative : copy.enNarrative}><textarea rows={6} lang={lang} value={caseFile.narrative[lang]} placeholder={copy.translationMissing} onChange={event => onChange({ ...caseFile, narrative: { ...caseFile.narrative, [lang]: event.target.value } })} /></Field></div>)}</div></section>
    <section className="summary-section"><div className="summary-section-heading"><Check size={20} /><div><h2>{copy.evidenceTitle}</h2><p>{copy.evidenceSummaryNote}</p></div></div><EvidenceFields language={language} caseFile={caseFile} onChange={onChange} /></section>
    <section className="summary-section summary-safety"><div className="summary-section-heading"><ShieldCheck size={20} /><div><h2>{copy.safeContactTitle}</h2><p>{copy.safeContactNote}</p></div></div>{(caseFile.contactSafety.safeToCall === false || caseFile.contactSafety.safeToLeaveVoicemail === false || caseFile.contactSafety.safeToEmail === false) && <div className="summary-safety-alert" role="status">{caseFile.contactSafety.safeToCall === false && <strong>{copy.noCalls}</strong>}{caseFile.contactSafety.safeToLeaveVoicemail === false && <strong>{copy.noVoicemail}</strong>}{caseFile.contactSafety.safeToEmail === false && <strong>{copy.noEmails}</strong>}</div>}<SafeContactFields language={language} caseFile={caseFile} onChange={onChange} /></section>
    <section className="summary-section"><div className="summary-section-heading"><LockKeyhole size={20} /><div><h2>{copy.employerTitle}</h2><p>{copy.employerNote}</p></div></div><EmployerFields language={language} caseFile={caseFile} onChange={onChange} /></section>
    <details className="summary-json"><summary><FileJson size={18} /><span>{copy.fullFile}</span><ChevronDown size={17} /></summary><div className="summary-json-body"><p>{copy.fullFileNote}</p><Field label={copy.fullFile}><textarea className="summary-json-input" rows={16} value={jsonDraft} spellCheck={false} autoComplete="off" aria-invalid={jsonError} onChange={event => { setJsonDraft(event.target.value); setJsonDirty(true); setJsonError(false); }} /></Field>{jsonError && <p className="summary-error" role="alert">{copy.invalidFile}</p>}<button className="intake-secondary" onClick={applyJson}>{copy.applyFile}<Check size={16} /></button></div></details>
    <section className="summary-consent"><h2>{copy.consentTitle}</h2><label className="intake-check"><input type="checkbox" checked={caseFile.consent.shareWithRMWC} onChange={event => consent('shareWithRMWC', event.target.checked)} /><span>{copy.shareConsent}</span></label><label className="intake-check"><input type="checkbox" checked={caseFile.consent.storeAnonymisedStats} onChange={event => consent('storeAnonymisedStats', event.target.checked)} /><span>{copy.statsConsent}</span></label><p>{copy.consentNote}</p></section>
    <section className="summary-exits-section"><span className="intake-eyebrow">{copy.exitsTitle}</span><div className="summary-exits"><article className="summary-exit"><ExternalLink size={23} /><h3>{copy.clinicTitle}</h3><p>{copy.clinicText}</p><a className="intake-secondary" href={RMWC_CLINIC_URL} target="_blank" rel="noopener noreferrer">{copy.clinicAction}<ArrowRight size={16} /></a></article><article className="summary-exit"><Download size={23} /><h3>{copy.saveTitle}</h3><p>{copy.saveText}</p><div className="summary-download-actions"><button className="intake-secondary" onClick={saveDraft}>{copy.saveAction}<span>JSON</span></button><button className="intake-secondary summary-text-download" onClick={saveText} aria-label={`${copy.saveAction} · TXT`}>TXT<Download size={14} /></button></div></article><article className="summary-exit"><Phone size={23} /><h3>{copy.callTitle}</h3><p>{copy.callText}</p><a className="intake-secondary" href="tel:1300513107">{copy.callAction}<ArrowRight size={16} /></a></article><article className="summary-exit"><Share2 size={23} /><h3>{copy.shareTitle}</h3><p>{copy.shareText}</p><button className="intake-secondary" onClick={() => void shareApp()}>{copy.shareAction}<ArrowRight size={16} /></button></article></div><p className="summary-handoff"><LockKeyhole size={15} />{copy.handoff}</p><p className="summary-download-note">{copy.downloadNote}</p></section>
    {notice && <div className="summary-notice" role="status"><Check size={17} /><span>{copy[notice]}</span><button onClick={() => setNotice(null)} aria-label={copy.close}>×</button></div>}
    {shareUrl && <div className="summary-share-fallback"><Copy size={18} /><Field label={copy.shareFallback}><input readOnly value={shareUrl} onFocus={event => event.target.select()} /></Field><button className="intake-text-button" onClick={() => setShareUrl('')}>{copy.close}</button></div>}
    <p className="intake-bottom-note">{copy.disclaimer}</p>
  </section>;
}
