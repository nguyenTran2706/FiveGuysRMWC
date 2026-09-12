import { CloudRain, ShieldCheck, Volume2, VolumeX } from 'lucide-react';
import type { copy } from '../data/copy';
import './TitleScreen.css';

type Copy = (typeof copy)['vi'];

type Props = {
  t: Copy;
  time: string;
  sound: boolean;
  onStart: () => void;
  onHelp: () => void;
  onSettings: () => void;
  onPrivacy: () => void;
  onSound: () => void;
  onDiscover: () => void;
};

export function TitleScreen({ t, time, sound, onStart, onHelp, onSettings, onPrivacy, onSound, onDiscover }: Props) {
  return (
    <section className="title-screen">
      <img className="title-screen-portrait" src="/images/linh.webp" alt="" fetchPriority="high" />
      <div className="title-screen-fade" aria-hidden="true" />
      <div className="title-screen-scanlines" aria-hidden="true" />

      <div className="title-screen-inner">
        <div>
          <h1 className="title-screen-logo"><span>{t.titleFirst}</span><span>{t.titleSecond}</span></h1>
          <p className="title-screen-sub">{t.englishTitle}</p>
        </div>
        <nav className="title-screen-menu" aria-label={t.brand}>
          <button className="is-primary" onClick={onStart}>{t.understand}</button>
          <button onClick={onHelp}>{t.helpNow}</button>
          <button onClick={onDiscover}>{t.discover}</button>
          <button onClick={onSettings}>{t.settings}</button>
        </nav>
      </div>

      <div className="title-screen-meta">
        <span className="amber">{t.presents}</span>
        <span>{t.location}</span>
        <span><CloudRain size={12} /> {time} AEST · {t.rain}</span>
        <button onClick={onSound} aria-label={sound ? t.soundOff : t.sound}>{sound ? <Volume2 size={12} /> : <VolumeX size={12} />}</button>
        <button onClick={onPrivacy}><ShieldCheck size={12} /> {t.private}</button>
      </div>
    </section>
  );
}

export default TitleScreen;
