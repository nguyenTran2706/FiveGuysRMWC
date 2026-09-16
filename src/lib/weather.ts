import type { Choice } from '../types';

export const INITIAL_TENSION = 0.4;
export const clamp = (value: number, min = 0, max = 1) => Math.max(min, Math.min(max, value));

// Only fictional conversation choices affect weather. Visitor answers never do.
export function tensionAfterChoice(tension: number, choice: Pick<Choice, 'trust' | 'recordEvidence'>): number {
  const delta = choice.trust ?? 0;
  return clamp(tension + (delta < 0 ? Math.abs(delta) * 0.22 : delta > 0 ? -delta * 0.12 : 0) - (choice.recordEvidence ? 0.08 : 0));
}

export function rainMix(tension: number, adaptive = true) {
  const value = adaptive ? clamp(tension) : INITIAL_TENSION;
  // Equal-power transition between soft and dense field recordings. The storm
  // layer stays quiet and distant, even at the highest tension.
  return { calm: Math.cos(value * Math.PI / 2) * 0.42, heavy: Math.sin(value * Math.PI / 2) * 0.46, thunder: Math.max(0, (value - 0.6) / 0.4) * 0.1 };
}
