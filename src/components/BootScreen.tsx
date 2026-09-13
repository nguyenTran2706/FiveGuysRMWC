import type { copy } from '../data/copy';
import './BootScreen.css';

type Copy = (typeof copy)['vi'];

/** Cinematic boot/loading screen shown while a lazy page is preparing. */
export function BootScreen({ t }: { t: Copy }) {
  return (
    <div className="boot-screen" role="status" aria-live="polite">
      <div className="boot-brand">
        <svg width="35" height="40" viewBox="0 0 35 40" fill="none" aria-hidden="true"><path d="M3 37V8l28-5v34M17 6v31M3 21h28" stroke="currentColor" strokeWidth="1.6" /></svg>
        <span><strong>{t.brand}</strong><small>{t.byline}</small></span>
      </div>

      <h2 className="boot-title"><span>{t.titleFirst}</span><span>{t.titleSecond.replace(/\.$/, '')}<i>.</i></span></h2>
      <p className="boot-sub">{t.englishTitle}</p>

      <ul className="boot-steps">
        {t.bootSteps.map((step, index) => (
          <li key={step} style={{ animationDelay: `${index * 0.18}s` }}><span>+</span>{step}</li>
        ))}
      </ul>

      <div className="boot-cta"><strong>{t.bootStart}</strong><em>{t.bootWait}</em></div>
      <p className="boot-note">{t.bootNote}</p>

      <div className="boot-footer"><span>{t.location}</span></div>
    </div>
  );
}

export default BootScreen;
