import type { Copy } from '../data/copy';

/** Map a session's trust value to one of five readable levels. */
export function getTrustLevel(trust: number): 0 | 1 | 2 | 3 | 4 {
  if (trust <= -2) return 0;
  if (trust < 0) return 1;
  if (trust === 0) return 2;
  if (trust < 4) return 3;
  return 4;
}

/** Small always-visible indicator of how open the resident is to you. */
export function TrustMeter({ t, trust }: { t: Copy; trust: number }) {
  const level = getTrustLevel(trust);
  return <div className="trust-meter" role="meter" aria-label={t.trustAria} aria-valuenow={trust} aria-valuemin={-3} aria-valuemax={6}>
    <span className="story-progress-label">{t.trustLabel}</span>
    <span className="trust-state">{t.trustStates[level]}</span>
    <span className="trust-track"><i className={level <= 1 ? 'low' : level === 2 ? 'mid' : ''} style={{ width: `${((level + 1) / 5) * 100}%` }} /></span>
  </div>;
}
