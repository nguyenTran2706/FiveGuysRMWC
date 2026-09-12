import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, AudioLines, Check, ChevronRight, CloudRain, ExternalLink, Headphones, HeartHandshake, Languages, Maximize, MessageCircle, Pause, Play, Settings2, ShieldCheck, Volume2, VolumeX, X } from 'lucide-react';
import type { Choice, Language, Resident } from './types';
import { createCaseFile } from './types';
import { residents, legalNotes } from './data/stories';
import { copy } from './data/copy';
import { useAmbient } from './hooks/useAmbient';
import { useSydneyTime } from './hooks/useSydneyTime';
import { Modal } from './components/Modal';
import { TitleScreen } from './components/TitleScreen';
import { BootScreen } from './components/BootScreen';

const Intake = lazy(() => import('./components/Intake'));
const Summary = lazy(() => import('./components/Summary'));
type Page = 'home' | 'street' | 'game' | 'turn' | 'intake' | 'review';
type Overlay = 'privacy' | 'settings' | 'pause' | 'warning' | 'waiting' | 'reset' | null;
type Stage = 'dialogue' | 'reflection' | 'artifact' | 'deepening' | 'epilogue';
type Session = { node: string; trust: number; kept: boolean; status: 'playing' | 'heard' | 'closed' };

function WindowMark({ small = false }: { small?: boolean }) {
  return <svg width={small ? 26 : 35} height={small ? 30 : 40} viewBox="0 0 35 40" fill="none" aria-hidden="true"><path d="M3 37V8l28-5v34M17 6v31M3 21h28" stroke="currentColor" strokeWidth="1.6" /><path d="M8 37V13l5-1v25" fill="currentColor" fillOpacity=".25" /></svg>;
}

export default function App() {
  const [language, setLanguage] = useState<Language>('vi');
  const [page, setPage] = useState<Page>('home');
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [sound, setSound] = useState(false);
  const [bilingual, setBilingual] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [caseFile, setCaseFile] = useState(() => createCaseFile('vi', 'street'));
  const [sessions, setSessions] = useState<Record<string, Session>>({});
  const [approaches, setApproaches] = useState<Record<string, number>>({});
  const [activeId, setActiveId] = useState('linh');
  const [stage, setStage] = useState<Stage>('dialogue');
  const [note, setNote] = useState('');
  const [speaking, setSpeaking] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const active = residents.find(resident => resident.id === activeId) ?? residents[0];
  const session = sessions[activeId];
  const node = active.nodes[session?.node ?? active.start];
  const t = copy[language];
  const sydneyTime = useSydneyTime(language);
  const heardResidents = residents.filter(resident => sessions[resident.id]?.status === 'heard');
  const completedCount = Object.values(sessions).filter(item => item.status !== 'playing').length;
  const unlocked = heardResidents.length >= 3;
  const mainRef = useRef<HTMLElement>(null);
  useAmbient(sound && page !== 'intake' && page !== 'review' && page !== 'turn' && overlay !== 'pause' && !speaking);

  const cancelSpeech = useCallback(() => { window.speechSynthesis?.cancel(); setSpeaking(false); }, []);
  const quickExit = useCallback(() => {
    window.speechSynthesis?.cancel();
    setSound(false); setCaseFile(createCaseFile('vi', 'street')); setSessions({}); setApproaches({}); setNote('');
    window.history.replaceState(null, '', '/');
    window.location.replace('https://www.bom.gov.au/');
  }, []);
  useEffect(() => {
    const onEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') { event.preventDefault(); quickExit(); } };
    window.addEventListener('keydown', onEscape);
    return () => window.removeEventListener('keydown', onEscape);
  }, [quickExit]);
  useEffect(() => {
    document.documentElement.lang = language;
    setCaseFile(current => ({ ...current, language }));
    cancelSpeech();
  }, [language, cancelSpeech]);
  useEffect(() => { cancelSpeech(); }, [page, activeId, session?.node, stage, cancelSpeech]);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    mainRef.current?.focus({ preventScroll: true });
  }, [page]);
  useEffect(() => {
    const hide = () => { if (document.hidden) { cancelSpeech(); if (page === 'game') setOverlay('pause'); setSound(false); } };
    document.addEventListener('visibilitychange', hide);
    return () => document.removeEventListener('visibilitychange', hide);
  }, [page, cancelSpeech]);

  function navigate(next: Page) { cancelSpeech(); setOverlay(null); setPage(next); }
  function beginIntake() {
    if (page === 'home') setCaseFile(current => ({ ...current, source: 'agent' }));
    navigate('intake');
  }
  function openResident(resident: Resident, approved = false) {
    setActiveId(resident.id); setNote(''); setAudioError(false);
    if (resident.needsReturn && (approaches[resident.id] === undefined || approaches[resident.id] >= completedCount) && !sessions[resident.id]) {
      setApproaches(current => ({ ...current, [resident.id]: completedCount }));
      setOverlay('waiting'); return;
    }
    if (resident.warning && !approved && !sessions[resident.id]) { setOverlay('warning'); return; }
    const existing = sessions[resident.id];
    if (!existing) setSessions(current => ({ ...current, [resident.id]: { node: resident.start, trust: 0, kept: false, status: 'playing' } }));
    setStage(existing && existing.status !== 'playing' ? 'epilogue' : 'dialogue');
    navigate('game');
  }
  function finish(closed = false) {
    setSessions(current => ({ ...current, [activeId]: { ...current[activeId], status: closed ? 'closed' : 'heard' } }));
    setStage(closed ? 'epilogue' : 'reflection');
  }
  function advance() {
    if (!node || node.choices?.length) return;
    if (node.next === 'reflection' || !node.next) finish();
    else if (node.next === 'closed') finish(true);
    else setSessions(current => ({ ...current, [activeId]: { ...current[activeId], node: node.next! } }));
  }
  function choose(choice: Choice) {
    const next = active.nodes[choice.next];
    setSessions(current => ({ ...current, [activeId]: { ...current[activeId], node: next ? choice.next : current[activeId].node, trust: current[activeId].trust + (choice.trust ?? 0), kept: current[activeId].kept || !!choice.recordEvidence } }));
    if (!next && choice.next === 'reflection') finish();
    else if (!next && choice.next === 'closed') finish(true);
  }
  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      if (page !== 'game' || overlay || stage !== 'dialogue' || event.altKey || event.ctrlKey || event.metaKey) return;
      const tag = (event.target as HTMLElement).tagName;
      if (['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON', 'A'].includes(tag)) return;
      if (event.code === 'Space') { event.preventDefault(); advance(); }
      const index = Number(event.key) - 1;
      if (index >= 0 && index < (node?.choices?.length ?? 0)) { event.preventDefault(); choose(node.choices![index]); }
    };
    window.addEventListener('keydown', keydown);
    return () => window.removeEventListener('keydown', keydown);
  });
  function speak(text: string) {
    if (speaking) { cancelSpeech(); return; }
    if (!('speechSynthesis' in window)) { setAudioError(true); return; }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'vi' ? 'vi-VN' : 'en-AU';
    const voice = window.speechSynthesis.getVoices().find(item => item.lang.startsWith(language));
    if (voice) utterance.voice = voice;
    utterance.rate = .9;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => { setSpeaking(false); setAudioError(true); };
    setSpeaking(true); setAudioError(false); window.speechSynthesis.speak(utterance);
  }
  function reflect(answer: 'yes' | 'no' | 'possible' | 'skip') {
    if (answer === 'yes' || answer === 'possible') {
      setCaseFile(current => ({ ...current, flags: [...current.flags.filter(flag => flag.sourceNpc !== activeId), { archetype: active.archetype, confidence: answer === 'yes' ? 'strong' : 'possible', signals: [(answer === 'yes' ? t.signalSimilar : t.signalUnsure).replace('{name}', active.name)], sourceNpc: activeId }] }));
    } else {
      setCaseFile(current => ({ ...current, flags: current.flags.filter(flag => flag.sourceNpc !== activeId) }));
    }
    setStage(answer === 'yes' ? 'deepening' : activeId === 'linh' ? 'artifact' : 'epilogue');
  }
  function saveNote() {
    if (note.trim()) setCaseFile(current => ({ ...current, narrative: { ...current.narrative, [language]: [current.narrative[language], note.trim()].filter(Boolean).join('\n\n') }, flags: current.flags.map(flag => flag.sourceNpc === activeId ? { ...flag, signals: [...flag.signals, note.trim()] } : flag) }));
    setNote(''); setStage(activeId === 'linh' ? 'artifact' : 'epilogue');
  }
  function payslipAnswer(answer?: 'always' | 'sometimes' | 'never') {
    if (answer) setCaseFile(current => ({ ...current, detail: { ...current.detail, underpayment: { ...current.detail.underpayment, payslips: answer } }, evidenceHeld: { ...current.evidenceHeld, payslips: answer !== 'never' } }));
    setStage('epilogue');
  }
  function fullscreen() {
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
    else void document.documentElement.requestFullscreen?.().catch(() => {});
  }
  function reset() { setCaseFile(createCaseFile(language, 'street')); setSessions({}); setApproaches({}); setNote(''); setSound(false); navigate('home'); }
  function scrollAbout() {
    if (page !== 'home') { navigate('home'); setTimeout(() => document.getElementById('about')?.scrollIntoView({ behavior: reducedMotion ? 'instant' : 'smooth' }), 60); }
    else document.getElementById('about')?.scrollIntoView({ behavior: reducedMotion ? 'instant' : 'smooth' });
  }

  const residentCards = (limited = false) => <div className={`resident-grid ${limited ? 'resident-preview' : ''}`}>
    {(limited ? residents.slice(0, 3) : residents).map((resident, index) => <button key={resident.id} className={`resident-card resident-${resident.id}`} onClick={() => openResident(resident)}>
      <img src={resident.image} alt="" loading="lazy" width="640" height="440" />
      <div className="resident-scrim" /><span className="resident-number">{String(index + 1).padStart(2, '0')} <span>/</span> {resident.location[language]}</span>
      <div className="resident-content"><span className="eyebrow">{resident.role[language]}</span><h3>{resident.name}</h3><p>{resident.subtitle[language]}</p><p className="resident-intro">{resident.intro[language]}</p><div className="resident-action"><span>{sessions[resident.id]?.status === 'heard' ? t.heard : sessions[resident.id]?.status === 'closed' ? t.windowClosed : sessions[resident.id] ? t.continue : t.meet}</span><ArrowRight size={19} /></div></div>
    </button>)}
  </div>;

  return <div className={`app page-${page} ${reducedMotion ? 'reduce-motion' : ''}`}>
    <a className="skip-link" href="#main">{language === 'vi' ? 'Đến nội dung chính' : 'Skip to main content'}</a>
    <header className="site-header">
      <button className="brand" onClick={() => navigate('home')} aria-label="Know Your Rights — Home"><WindowMark /><span><strong>{t.brand}</strong><small>{t.byline}</small></span></button>
      <nav aria-label={language === 'vi' ? 'Điều hướng chính' : 'Main navigation'}><button className={page === 'street' || page === 'game' ? 'active' : ''} onClick={() => navigate('street')}>{t.story}</button><button onClick={scrollAbout}>{t.about}</button><button onClick={beginIntake}>{t.help}<ArrowUpRight /></button></nav>
      <div className="header-actions"><button className="language-button" onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')} aria-label={language === 'vi' ? 'Switch to English' : 'Chuyển sang tiếng Việt'}><Languages size={15} /><span>{language === 'vi' ? 'VI' : 'EN'}</span><span className="language-alternative">/ {language === 'vi' ? 'EN' : 'VI'}</span></button><button className="quick-exit" title={t.exitHint} onClick={quickExit}>{t.exit}<X size={15} /><kbd>ESC</kbd></button></div>
    </header>

    <main id="main" tabIndex={-1} ref={mainRef}>
      {page === 'home' && <>
        <section className="hero">
          <img className="hero-image" src="/images/street.webp" alt="" fetchPriority="high" width="1660" height="948" />
          <div className="hero-shade" /><div className="rain-overlay" aria-hidden="true" />
          <div className="hero-copy"><div className="hero-eyebrow"><span>{t.presents}</span><i /><span>{t.interactive}</span></div>
            <h1>{t.titleFirst}<br />{t.titleSecond}<span className="title-dot" /></h1>
            <div className="hero-subtitle"><span className="short-rule" />{t.englishTitle}</div>
            <p className="hero-intro">{t.intro}<br />{t.introSecond}</p>
            <p className="hero-description">{t.description}</p>
            <div className="door-actions"><button className="door-button door-story" onClick={() => openResident(residents[0])}><span className="door-icon"><Play size={19} fill="currentColor" /></span><span><small>{t.understandSub}</small><strong>{t.understand}</strong></span><ArrowRight size={20} /></button><button className="door-button door-help" onClick={beginIntake}><span className="door-icon"><MessageCircle size={21} /></span><span><small>{t.helpSub}</small><strong>{t.helpNow}</strong></span><ArrowRight size={20} /></button></div>
            <button className="privacy-inline" onClick={() => setOverlay('privacy')}><ShieldCheck size={13} />{t.private}</button>
          </div>
          <div className="scene-coordinate"><span className="live-dot" />{t.location}<span className="coordinate-weather"><CloudRain size={14} />{sydneyTime} · {t.rain}</span></div>
          <button className="hero-chapter" onClick={() => openResident(residents[0])}><span className="chapter-number">01</span><span className="chapter-detail"><small>{t.chapter}</small><strong>{t.chapterTitle}</strong><span>{t.chapterCaption}</span></span><span className="round-play"><Play size={17} fill="currentColor" /></span></button>
          <div className="hero-bottom"><button className="audio-toggle" onClick={() => setSound(!sound)} aria-label={sound ? t.soundOff : t.sound}><span className={`audio-bars ${sound ? 'playing' : ''}`}><i /><i /><i /><i /><i /></span><span>{t.headphones}</span>{sound ? <Volume2 size={15} /> : <VolumeX size={15} />}</button><button className="discover-link" onClick={() => document.getElementById('stories')?.scrollIntoView({ behavior: reducedMotion ? 'instant' : 'smooth' })}>{t.discover}<ArrowDown size={16} /></button><span className="pace-note">{t.ownPace}<span> — {t.noTimer}</span></span></div>
        </section>
        <section className="stories-section section-wrap" id="stories"><div className="section-heading"><div><span className="eyebrow">{t.storiesEyebrow}</span><h2>{t.storiesTitle}</h2></div><button className="text-link" onClick={() => navigate('street')}>{t.story}<ArrowRight size={18} /></button></div>{residentCards(true)}</section>
        <section className="about-section section-wrap" id="about"><div className="about-lead"><span className="eyebrow">{t.aboutEyebrow}</span><h2>{t.aboutTitle}</h2><p>{t.aboutDescription}</p></div><div className="how-list">{[[t.howOne, t.howOneText], [t.howTwo, t.howTwoText], [t.howThree, t.howThreeText]].map(([title, body], index) => <div className="how-item" key={title}><span>0{index + 1}</span><div><h3>{title}</h3><p>{body}</p></div></div>)}</div></section>
        <section className="support-section section-wrap"><HeartHandshake size={28} strokeWidth={1.2} /><div><span className="eyebrow">REFUGEE AND MIGRANT WORKERS CENTRE NSW</span><h2>{t.supportHeading}</h2><p>{t.aboutRmwc}</p></div><a className="button button-outline" href="tel:1300513107">1300 513 107<ArrowUpRight /></a><p className="legal-disclaimer">{t.disclaimer}</p></section>
      </>}

      {page === 'street' && <section className="street-page section-wrap"><div className="street-heading"><span className="eyebrow">{t.location} <span className="amber-dot">·</span> {sydneyTime}</span><h1>{t.storiesTitle}</h1><p>{t.storiesIntro}</p></div>{residentCards()}
        <div className={`rmwc-card ${unlocked ? 'unlocked' : ''}`}><WindowMark /><div><span className="eyebrow">REFUGEE AND MIGRANT WORKERS CENTRE</span><h2>{unlocked ? t.rmwcOpen : t.supportHeading}</h2><p>{unlocked ? t.rmwcOpenText : t.turnHelp}</p></div><button className="button button-outline" onClick={() => navigate(unlocked ? 'turn' : 'intake')}>{unlocked ? t.stepInside : t.help}<ArrowRight size={18} /></button></div><p className="legal-disclaimer">{t.disclaimer}</p>
      </section>}

      {page === 'game' && <section className={`game-scene stage-${stage}`}>
        <img key={active.id} src={active.image} className="game-image" alt="" width="1672" height="940" /><div className="game-shade" /><div className="rain-overlay" aria-hidden="true" />
        <div className="game-topbar"><button className="text-link" onClick={() => navigate('street')}><ArrowLeft size={17} />{t.walk}</button><div className="player-controls"><button className="icon-button" onClick={() => setSound(!sound)} title={sound ? t.soundOff : t.sound} aria-label={sound ? t.soundOff : t.sound}>{sound ? <Volume2 size={19} /> : <VolumeX size={19} />}</button><button className="icon-button" onClick={() => { cancelSpeech(); setOverlay('pause'); }} title={t.pause} aria-label={t.pause}><Pause size={18} /></button><button className="icon-button" onClick={() => setOverlay('settings')} title={t.settings} aria-label={t.settings}><Settings2 size={19} /></button><button className="icon-button fullscreen-button" onClick={fullscreen} title={t.fullScreen} aria-label={t.fullScreen}><Maximize size={17} /></button></div></div>
        <div className="scene-id"><span className="eyebrow">{active.location[language]}</span><span className="scene-name">{active.name}</span><span className="scene-role">{active.role[language]}</span></div>

        {stage === 'dialogue' && node && <div className="dialogue-panel" key={`${activeId}-${node.id}`}>
          <div className={`dialogue-copy ${node.kind === 'artifact' ? 'artifact-dialogue' : ''}`}><div className="speaker-line"><span>{node.speaker ?? active.name}</span><button className="icon-button" onClick={() => speak(node.text[language])} title={speaking ? t.stopReading : t.listen} aria-label={speaking ? t.stopReading : t.listen}>{speaking ? <AudioLines size={18} /> : <Volume2 size={18} />}</button></div><p className="dialogue-text" aria-live="polite">{node.text[language]}</p>{bilingual && <p className="secondary-dialogue" lang={language === 'vi' ? 'en' : 'vi'}>{node.text[language === 'vi' ? 'en' : 'vi']}</p>}{audioError && <p className="audio-error" role="status">{t.voiceUnavailable}</p>}</div>
          {/visa/i.test(node.text.en) && <aside className="scene-visa-note"><ShieldCheck size={17} /><div><strong>{t.visaTitle}</strong><p>{t.visaNote}</p><a href="https://www.fairwork.gov.au/find-help-for/visa-holders-migrants/visa-protections-pilot-programs" target="_blank" rel="noopener noreferrer">Fair Work<ExternalLink size={11} /></a></div></aside>}
          {node.choices?.length ? <div className="choice-area"><div className="choice-heading"><span>{t.choose}</span><span>{t.choicesHint}</span></div><div className="choices">{node.choices.map((choice, index) => <button className="choice-button" key={choice.id} onClick={() => choose(choice)}><span className="choice-index">{index + 1}</span><span>{choice.text[language]}</span><ChevronRight size={18} /></button>)}</div></div> : <div className="continue-row"><span className="scene-caption"><span className="short-rule" />{t.fictional}</span><button className="continue-button" onClick={advance}>{t.next}<span className="keycap">{t.space}</span><ArrowRight size={20} /></button></div>}
        </div>}

        {(stage === 'reflection' || stage === 'artifact' || stage === 'deepening') && <div className="reflection-wrap"><div className="reflection-panel"><span className="eyebrow">{t.reflectionEyebrow}</span><h2>{stage === 'deepening' ? t.deepeningTitle : stage === 'artifact' ? t.artifactQuestion : t.reflectionTitle}</h2><p>{stage === 'deepening' ? t.deepeningHint : t.reflectionText}</p>
          {stage === 'reflection' && <div className="reflection-choices">{([['yes', t.yes], ['no', t.no], ['possible', t.unsure], ['skip', t.preferSkip]] as const).map(([value, label]) => <button className="button button-outline" key={value} onClick={() => reflect(value)}>{label}<ArrowRight size={17} /></button>)}</div>}
          {stage === 'artifact' && <div className="reflection-choices">{([['always', t.always], ['sometimes', t.sometimes], ['never', t.never]] as const).map(([value, label]) => <button className="button button-outline" key={value} onClick={() => payslipAnswer(value)}>{label}<ArrowRight size={17} /></button>)}<button className="button button-outline" onClick={() => payslipAnswer()}>{t.preferSkip}<ArrowRight size={17} /></button></div>}
          {stage === 'deepening' && <><label className="sr-only" htmlFor="reflection-note">{t.deepeningTitle}</label><textarea id="reflection-note" value={note} maxLength={10000} onChange={event => setNote(event.target.value)} placeholder={t.deepeningPlaceholder} rows={4} /><div className="reflection-actions"><button className="button button-amber" onClick={saveNote}>{t.keepNote}<ArrowRight size={17} /></button><button className="text-link" onClick={() => { setNote(''); setStage(activeId === 'linh' ? 'artifact' : 'epilogue'); }}>{t.skip}</button></div></>}
          <div className="rights-note"><ShieldCheck size={19} /><div><span className="eyebrow">{t.generalInfo}</span><p>{legalNotes[active.archetype][language]}</p><a href="https://www.fairwork.gov.au/find-help-for/visa-holders-migrants" target="_blank" rel="noopener noreferrer">{t.learnRights}<ExternalLink size={12} /></a></div></div>
        </div></div>}

        {stage === 'epilogue' && <div className="epilogue-panel"><span className="eyebrow">{t.epilogueEyebrow} <span>· {active.name}</span></span><h2>{t.epilogueTitle}</h2><p className="epilogue-text">{active.epilogue[session?.kept && session.status !== 'closed' ? 'kept' : 'missed'][language]}</p><p className="fiction-note">{t.fiction}</p><div className="epilogue-actions"><button className="button button-amber" onClick={() => navigate('street')}>{t.nextDoor}<ArrowRight size={18} /></button>{unlocked && <button className="button button-outline" onClick={() => navigate('turn')}>{t.stepInside}<ArrowRight size={18} /></button>}</div></div>}
      </section>}

      {page === 'turn' && <section className="turn-page"><WindowMark /><span className="eyebrow">{t.turnEyebrow}</span><h1>{t.turnTitle}</h1><p className="turn-intro">{t.turnText.replace('{names}', heardResidents.map(item => item.name).join(', '))}</p><div className="turn-boundary"><ShieldCheck size={21} /><div><p>{t.turnPrivacy}</p><p>{t.disclaimer}</p></div></div><div className="turn-actions"><button className="button button-amber" onClick={beginIntake}>{t.beginIntake}<ArrowRight size={18} /></button><button className="button button-outline" onClick={() => navigate('street')}>{t.keepExploring}</button></div><button className="text-link" onClick={() => navigate('review')}>{t.review}<ArrowRight size={16} /></button></section>}
      <Suspense fallback={<BootScreen t={t} />}>
        {page === 'intake' && <Intake language={language} caseFile={caseFile} onChange={setCaseFile} onReview={() => navigate('review')} onBack={() => navigate(completedCount ? 'street' : 'home')} />}
        {page === 'review' && <Summary language={language} caseFile={caseFile} onChange={setCaseFile} onBack={() => navigate('intake')} />}
      </Suspense>
    </main>

    <footer className="safety-footer"><span className="footer-label"><span className="live-dot" />{t.helpFooter}</span><div className="safety-links"><a href="tel:1300513107">RMWC <strong>1300 513 107</strong></a><span>·</span><a href="tel:131114">Lifeline <strong>13 11 14</strong></a><span>·</span><a href="tel:000">{t.emergency} <strong>000</strong></a></div><button onClick={() => setOverlay('privacy')}><ShieldCheck size={13} /><span>{t.privacy}</span></button></footer>

    {overlay === 'privacy' && <Modal title={t.privacyTitle} closeLabel={t.close} onClose={() => setOverlay(null)}><ShieldCheck className="modal-symbol" size={28} /><p>{t.privacyText}</p><p>{t.privacyExit}</p><p className="modal-note">{t.disclaimer}</p><button className="button button-outline" onClick={() => setOverlay(null)}>{t.close}<Check size={16} /></button></Modal>}
    {overlay === 'settings' && <Modal title={t.settings} closeLabel={t.close} onClose={() => setOverlay(null)}><div className="setting-row"><span><Headphones size={18} />{t.audioLabel}</span><button className={`switch ${sound ? 'on' : ''}`} role="switch" aria-checked={sound} aria-label={t.audioLabel} onClick={() => setSound(!sound)}><i /></button></div><div className="setting-row"><span><Languages size={18} />{t.subtitlesLabel}</span><button className={`switch ${bilingual ? 'on' : ''}`} role="switch" aria-checked={bilingual} aria-label={t.subtitlesLabel} onClick={() => setBilingual(!bilingual)}><i /></button></div><div className="setting-row"><span><Play size={17} />{t.reducedLabel}</span><button className={`switch ${reducedMotion ? 'on' : ''}`} role="switch" aria-checked={reducedMotion} aria-label={t.reducedLabel} onClick={() => setReducedMotion(!reducedMotion)}><i /></button></div><p className="modal-note">{t.settingsNote}</p><button className="text-link" onClick={() => setOverlay('reset')}>{t.reset}<ArrowRight size={16} /></button></Modal>}
    {overlay === 'pause' && <Modal title={t.paused} closeLabel={t.close} onClose={() => setOverlay(null)}><p>{t.pausedText}</p><button className="button button-amber" onClick={() => setOverlay(null)}><Play size={17} />{t.resume}</button><button className="text-link modal-secondary" onClick={() => navigate('street')}>{t.walk}<ArrowRight size={16} /></button></Modal>}
    {overlay === 'warning' && <Modal title={t.warningTitle} closeLabel={t.close} onClose={() => setOverlay(null)}><span className="eyebrow warning-label">{t.warning}</span><p>{active.warning?.[language]}</p><p>{t.warningIntro}</p><div className="modal-actions"><button className="button button-outline" onClick={() => openResident(active, true)}>{t.enterAnyway}<ArrowRight size={17} /></button><button className="button button-outline" onClick={() => navigate('street')}>{t.skipStory}</button></div></Modal>}
    {overlay === 'waiting' && <Modal title={t.waitTitle} closeLabel={t.close} onClose={() => setOverlay(null)}><p>{t.waitBody}</p><button className="button button-outline" onClick={() => navigate('street')}>{t.walk}<ArrowRight size={17} /></button></Modal>}
    {overlay === 'reset' && <Modal title={t.reset} closeLabel={t.close} onClose={() => setOverlay(null)}><p>{t.resetText}</p><div className="modal-actions"><button className="button button-outline" onClick={reset}>{t.resetConfirm}</button><button className="button button-outline" onClick={() => setOverlay('settings')}>{t.back}</button></div></Modal>}
  </div>;
}

function ArrowUpRight() { return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4 12 12 4M4 4h8v8" stroke="currentColor" strokeWidth="1.4" /></svg>; }
