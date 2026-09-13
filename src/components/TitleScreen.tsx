import { ShieldCheck, Volume2, VolumeX } from 'lucide-react';
import type { copy } from '../data/copy';
import './TitleScreen.css';

type Props = {
  t: (typeof copy)['vi']; time: string; sound: boolean; hasSession: boolean;
  onStart: () => void; onHelp: () => void; onSettings: () => void;
  onPrivacy: () => void; onSound: () => void; onDiscover: () => void; onAbout: () => void;
};

export function TitleScreen({ t, time, sound, hasSession, onStart, onHelp, onSettings, onPrivacy, onSound, onDiscover, onAbout }: Props) {
  return <section className="title-screen" aria-labelledby="game-title">
    <img className="title-screen-art" src="/images/title-v2.webp" alt="" fetchPriority="high" width="1600" height="914" />
    <div className="title-screen-shade" aria-hidden="true" />
    <div className="title-screen-inner">
      <div className="title-screen-brand">
        <p className="title-screen-presenter">{t.presents}</p>
        <h1 id="game-title" className="title-screen-logo"><span>{t.titleFirst}</span><span>{t.titleSecond.replace(/\.$/, '')}</span></h1>
        <p className="title-screen-sub">{t.englishTitle}</p>
      </div>
      <nav className="title-screen-menu" aria-label={t.mainMenu}>
        <button className="title-start is-primary" onClick={onStart}>{hasSession ? t.continue : t.newGame}</button>
        <button className="title-discover" onClick={onDiscover}>{t.meetNeighbours}</button>
        <button className="title-settings" onClick={onSettings}>{t.menuSettings}</button>
        <button onClick={onAbout}>{t.about}</button>
        <button className="title-help" onClick={onHelp}>{t.helpNow}</button>
      </nav>
    </div>
    <div className="title-screen-meta">
      <div className="title-screen-place"><span>{t.location}</span><time className="aest-clock" aria-label={t.liveClock + ': ' + time}>{time}</time><small>{t.liveClock} · UTC+10</small></div>
      <div className="title-screen-tools"><button onClick={onSound} aria-pressed={sound} aria-label={sound ? t.soundOff : t.sound}>{sound ? <Volume2 size={16} /> : <VolumeX size={16} />}<span>{t.audioLabel}</span></button><button onClick={onPrivacy}><ShieldCheck size={15} /><span>{t.private}</span></button></div>
    </div>
  </section>;
}
