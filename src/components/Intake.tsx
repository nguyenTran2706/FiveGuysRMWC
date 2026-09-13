import { useRef, useState, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight, FileText, LockKeyhole, Phone, ShieldCheck, Sparkle } from 'lucide-react';
import type { Archetype, CaseFile, Language } from '../types';
import { FAIR_WORK_VISA_URL, intakeCopy } from '../data/intakeCopy';
import { flagsFromSelfReport, mergeFlags } from '../data/selfReport';
import QuestionFields from './IntakeQuestionFields';
import '../intake.css';

export interface CasePageProps { language: Language; caseFile: CaseFile; onChange: (file: CaseFile) => void; onBack: () => void }
interface IntakeProps extends CasePageProps { onReview: () => void }
type EvidenceKey = Exclude<keyof CaseFile['evidenceHeld'], 'notes'>;
const evidenceKeys: EvidenceKey[] = ['payslips', 'rosters', 'bankStatements', 'messagesFromEmployer', 'photos', 'witnessNames', 'contract'];
const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();

/** Conservative, deterministic interruption. It is not clinical or legal assessment. */
export function needsImmediateSupport(value: string): boolean {
  const input = normalize(value);
  return [
    /\b(emergency|suicid\w*|kill myself|end my life|cannot breathe|can.t breathe|bleeding (heavily|now)|need urgent (medical )?(help|care)|need (a doctor|medical (help|care)|hospital) (now|right now))\b/,
    /\b(threaten\w*.{0,40}(kill|hurt|hit|violence)|going to (kill|hurt|hit) me|sexually assaulted|sexual assault|raped|forced (me )?to have sex)\b/,
    /\b(no(where| place) to (sleep|stay).{0,25}tonight|homeless tonight|sleeping (on the street|outside) tonight)\b/,
    /\b((passport).{0,35}(held|holding|keep|kept|taken|took|confiscat)|((boss|employer).{0,30}(hold|keep|kept|took|taken)).{0,25}passport|not (free|allowed) to leave|won.t let me leave|cannot leave|can.t leave|debt bondage|forced labo[u]?r|locked (me )?in)\b/,
    /\b(cap cuu|muon tu tu|muon chet|tu sat|kho tho|chay mau nhieu|can (bac si|di vien).{0,15}(ngay|bay gio)|de doa.{0,25}(giet|danh)|bi (cuong hiep|hiep dam|tan cong tinh duc)|ep quan he|khong co (cho|noi) (ngu|o).{0,20}(dem nay|toi nay)|giu ho chieu|ho chieu.{0,20}(bi giu|bi thu)|khong (duoc|cho) (di|roi)|bi nhot|lao dong cuong buc|no le vi no)\b/,
    /\b(doa.{0,20}(giet|danh)|dang (danh|tan cong) toi|(toi nay|dem nay).{0,30}khong co (cho|noi) (ngu|o))\b/,
  ].some(pattern => pattern.test(input));
}

export function flagsFromOwnWords(value: string): CaseFile['flags'] {
  const rules: [Archetype, RegExp][] = [
    ['underpayment', /underpaid|unpaid|no payslip|not (being )?paid|pay.{0,20}(short|missing)|khong (duoc )?tra luong|luong thap|thieu luong|khong co (phieu luong|payslip)|tru luong/],
    ['sham_contracting', /\babn\b|sham contract|ep.{0,20}hop dong thau|tu lam chu/],
    ['workplace_injury', /injur|hurt at work|workplace accident|bi thuong|tai nan lao dong|dau lung|bong tay/],
    ['unfair_dismissal', /fired|dismissed|sacked|no (more )?shifts|hours.{0,20}(zero|cut)|forced.{0,15}resign|sa thai|duoi viec|cat (het )?ca|ep nghi/],
    ['discrimination', /discriminat|racis|because.{0,25}(race|age|pregnan|vietname)|phan biet doi xu|ky thi/],
    ['sexual_harassment', /sexual harassment|touch.{0,20}(without|unwanted)|quan roi tinh duc|quay roi|so mo|dong cham/],
    ['bullying', /bully|bullied|humiliat|shout.{0,15}(every|daily)|bat nat|lang ma|si nhuc|chui.{0,15}(moi|hang)/],
  ];
  const sentences = value.split(/[.!?\n]+/).map(x => x.trim()).filter(Boolean);
  return rules.flatMap(([archetype, pattern]) => {
    const signal = sentences.find(sentence => {
      const normalized = normalize(sentence);
      if (/\b(no harassment|not (bullied|injured|underpaid|fired)|never (bullied|harassed)|khong bi (bat nat|quay roi|sa thai))\b/.test(normalized)) return false;
      return pattern.test(normalized);
    });
    return signal ? [{ archetype, confidence: 'possible' as const, signals: [signal.slice(0, 360)] }] : [];
  });
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return <label className="intake-field"><span>{label}</span>{children}{hint && <small>{hint}</small>}</label>;
}

export function BooleanSelect({ label, value, onChange, language }: { label: string; value: boolean | undefined; onChange: (value: boolean | undefined) => void; language: Language }) {
  const copy = intakeCopy[language];
  return <Field label={label}><select value={value === undefined ? '' : String(value)} onChange={event => onChange(event.target.value === '' ? undefined : event.target.value === 'true')}><option value="">{copy.notSure}</option><option value="true">{copy.yes}</option><option value="false">{copy.no}</option></select></Field>;
}

export function EvidenceFields({ language, caseFile, onChange }: Omit<CasePageProps, 'onBack'>) {
  const copy = intakeCopy[language];
  return <><div className="intake-evidence-grid">{evidenceKeys.map(key => <label className="intake-check" key={key}><input type="checkbox" checked={caseFile.evidenceHeld[key] === true} onChange={event => onChange({ ...caseFile, evidenceHeld: { ...caseFile.evidenceHeld, [key]: event.target.checked } })} /><span>{copy.evidence[key]}</span></label>)}</div><Field label={copy.evidenceNotes}><textarea rows={2} value={caseFile.evidenceHeld.notes ?? ''} placeholder={copy.evidencePlaceholder} onChange={event => onChange({ ...caseFile, evidenceHeld: { ...caseFile.evidenceHeld, notes: event.target.value } })} /></Field></>;
}

export function SafeContactFields({ language, caseFile, onChange }: Omit<CasePageProps, 'onBack'>) {
  const copy = intakeCopy[language];
  const update = (patch: Partial<CaseFile['contactSafety']>) => onChange({ ...caseFile, contactSafety: { ...caseFile.contactSafety, ...patch } });
  const channel = caseFile.contactSafety.preferredChannel;
  return <><div className="intake-field-grid"><Field label={copy.channel}><select value={channel ?? ''} onChange={event => update({ preferredChannel: (event.target.value || undefined) as CaseFile['contactSafety']['preferredChannel'] })}><option value="">{copy.choose}</option>{Object.entries(copy.channels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></Field>{channel && channel !== 'zalo' && channel !== 'messenger' && <Field label={channel === 'email' ? 'Email' : copy.phone}><input type={channel === 'email' ? 'email' : 'tel'} autoComplete="off" value={(channel === 'email' ? caseFile.contact?.email : caseFile.contact?.phone) ?? ''} placeholder={copy.contactPlaceholder} onChange={event => onChange({ ...caseFile, contact: { ...caseFile.contact, [channel === 'email' ? 'email' : 'phone']: event.target.value } })} /></Field>}<BooleanSelect label={copy.safeToCall} value={caseFile.contactSafety.safeToCall} onChange={value => update({ safeToCall: value })} language={language} /><BooleanSelect label={copy.safeVoicemail} value={caseFile.contactSafety.safeToLeaveVoicemail} onChange={value => update({ safeToLeaveVoicemail: value })} language={language} /><BooleanSelect label={copy.safeEmail} value={caseFile.contactSafety.safeToEmail} onChange={value => update({ safeToEmail: value })} language={language} /><Field label={copy.bestTime}><input value={caseFile.contactSafety.bestTimeOfDay ?? ''} onChange={event => update({ bestTimeOfDay: event.target.value })} /></Field></div><Field label={channel === 'zalo' || channel === 'messenger' ? `${copy.contactDetail} · ${copy.safetyNotes}` : copy.safetyNotes}><textarea rows={2} value={caseFile.contactSafety.notes ?? ''} placeholder={copy.safetyPlaceholder} onChange={event => update({ notes: event.target.value })} /></Field></>;
}

export function EmployerFields({ language, caseFile, onChange }: Omit<CasePageProps, 'onBack'>) {
  const copy = intakeCopy[language];
  return <div className="intake-field-grid"><Field label={copy.employerName}><input value={caseFile.employer?.name ?? ''} autoComplete="off" onChange={event => onChange({ ...caseFile, employer: { ...caseFile.employer, name: event.target.value } })} /></Field><Field label={copy.employerAddress}><input value={caseFile.employer?.address ?? ''} autoComplete="off" onChange={event => onChange({ ...caseFile, employer: { ...caseFile.employer, address: event.target.value } })} /></Field></div>;
}

export function CrisisOptions({ language }: { language: Language }) {
  const copy = intakeCopy[language];
  return <div className="intake-crisis" role="alert"><ShieldCheck size={28} /><h2>{copy.crisisTitle}</h2><p>{copy.crisisText}</p><div className="intake-crisis-links"><a href="tel:000"><span>000</span><small>{copy.crisisEmergency}</small><Phone size={18} /></a><a href="tel:1300513107"><span>RMWC · 1300 513 107</span><small>{copy.crisisRMWC}</small><Phone size={18} /></a><a href="tel:131114"><span>Lifeline · 13 11 14</span><small>{copy.crisisLifeline}</small><Phone size={18} /></a></div><small>{copy.crisisPrivate}</small></div>;
}

export default function Intake({ language, caseFile, onChange, onReview, onBack }: IntakeProps) {
  const copy = intakeCopy[language];
  const [started, setStarted] = useState(false);
  const [page, setPage] = useState(0);
  const [crisis, setCrisis] = useState(false);
  const [visaFear, setVisaFear] = useState(false);
  const [narrativeLanguage] = useState<Language>(() => caseFile.narrative.vi ? 'vi' : caseFile.narrative.en ? 'en' : language);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const questions = [copy.narrativeQuestion, copy.industryQuestion, copy.employmentQuestion, copy.visaQuestion, copy.payQuestion, copy.selfReportQuestion, copy.detailQuestion, copy.evidenceQuestion, copy.contactQuestion, copy.alternateQuestion, copy.employerQuestion];
  const notes = [copy.noPressure, '', '', copy.visaNote, copy.payNote, copy.selfReportNote, copy.detailNote, copy.evidenceNote, copy.contactNote, copy.alternateNote, copy.employerNote];
  const pages: number[][] = [[0, 1, 2, 3, 4], [5, 6], [7, 8, 9, 10]];

  function turn(review = false) {
    const words = [caseFile.narrative.vi, caseFile.narrative.en, caseFile.profile.role, caseFile.profile.industry, caseFile.evidenceHeld.notes, caseFile.contactSafety.notes, caseFile.contactSafety.bestTimeOfDay, caseFile.emergencyContact?.name, caseFile.emergencyContact?.relationship, caseFile.employer?.name, caseFile.employer?.address].filter(Boolean).join('\n');
    if (needsImmediateSupport(words)) { setCrisis(true); return; }
    if (/visa|deport|immigra|di tru|truc xuat|bi duoi ve/.test(normalize(words))) setVisaFear(true);
    const ownWords = `${caseFile.narrative.vi}\n${caseFile.narrative.en}`;
    const declared = flagsFromSelfReport(caseFile);
    const guessed = mergeFlags(declared, flagsFromOwnWords(ownWords));
    const nextFlags = mergeFlags(declared, mergeFlags(guessed, caseFile.flags));
    if (JSON.stringify(nextFlags) !== JSON.stringify(caseFile.flags)) onChange({ ...caseFile, flags: nextFlags });
    if (review || page === pages.length - 1) { onReview(); return; }
    setPage(previous => previous + 1);
    requestAnimationFrame(() => headingRef.current?.focus());
  }

  return <section className="intake-page">
    <div className="intake-topline"><button className="intake-back" onClick={onBack}><ArrowLeft size={16} />{copy.back}</button><span className="intake-private"><LockKeyhole size={13} />{copy.private}</span></div>
    <div className="intake-layout"><aside className="intake-aside"><span className="intake-eyebrow">{copy.eyebrow}</span><h1>{copy.title}</h1><p>{copy.intro}</p><div className="intake-assistant-label"><Sparkle size={17} /><span>{copy.local}<small>{copy.localNote}</small></span></div><button className="intake-review-link" onClick={() => crisis ? onReview() : turn(true)}><FileText size={16} />{copy.review}<ArrowRight size={16} /></button></aside>
    <section className="intake-conversation" aria-label={copy.local}>
      {crisis ? <><CrisisOptions language={language} /><button className="intake-primary" onClick={onReview}>{copy.review}<ArrowRight size={17} /></button></> : !started ? <div className="intake-consent-boundary"><div className="intake-boundary-icon"><ShieldCheck size={29} /></div><h2>{copy.privacy}</h2><p>{copy.optional}</p><p className="intake-disclaimer">{copy.disclaimer}</p><button className="intake-primary" onClick={() => { setStarted(true); requestAnimationFrame(() => headingRef.current?.focus()); }}>{copy.begin}<ArrowRight size={17} /></button><button className="intake-text-button" onClick={() => turn(true)}>{copy.review}</button></div> : <form onSubmit={event => { event.preventDefault(); turn(); }}>
      <div className="intake-question-heading"><span className="intake-eyebrow">{copy.questions}</span><span>{copy.pageLabel[page]}</span></div><h2 ref={headingRef} tabIndex={-1}>{copy.pageTitles[page]}</h2><p className="intake-question-note">{copy.pageNotes[page]}</p>
      <div className="intake-answer-area" key={page}>
      {pages[page].map(step => <div className="intake-block" key={step}>
        <h3>{questions[step]}</h3>{notes[step] && <p className="intake-question-note">{notes[step]}</p>}
        <QuestionFields step={step} language={language} caseFile={caseFile} onChange={onChange} narrativeLanguage={narrativeLanguage} onNarrativeChange={value => { onChange({ ...caseFile, narrative: { ...caseFile.narrative, [narrativeLanguage]: value } }); setVisaFear(/visa|deport|immigra|di tru|truc xuat|bi duoi ve|so.{0,25}(482|500|gio lam)/.test(normalize(value))); }} />
        {(step === 3 || (step === 0 && visaFear)) && <div className="intake-visa-note"><ShieldCheck size={18} /><div><strong>{copy.visaReassuranceTitle}</strong><p>{copy.visaReassurance}</p><a href={FAIR_WORK_VISA_URL} target="_blank" rel="noopener noreferrer">{copy.visaLink}<ArrowRight size={13} /></a></div></div>}
      </div>)}
      </div><div className="intake-form-actions"><button className="intake-text-button" type="button" onClick={() => turn()}>{copy.skipPage}</button><button className="intake-primary" type="submit">{page === pages.length - 1 ? copy.review : copy.next}<ArrowRight size={17} /></button></div>
      </form>}
    </section></div>
  </section>;
}
