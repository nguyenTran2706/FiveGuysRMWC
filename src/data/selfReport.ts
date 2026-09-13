import type { Archetype, CaseFile } from '../types';

/** The categories a worker can declare for themselves, in the order they are shown. */
export const selfReportCategories: Archetype[] = [
  'underpayment', 'unfair_dismissal', 'sham_contracting', 'workplace_injury',
  'discrimination', 'sexual_harassment', 'bullying',
];

/**
 * A category the worker ticked is recorded as declared, with their own reason as the signal.
 * Nothing scores or overrules the declaration — the rules engine only adds supporting detail.
 */
export function flagsFromSelfReport(file: CaseFile): CaseFile['flags'] {
  const selected = file.selfReported?.categories ?? [];
  return selected.map(archetype => {
    const reason = file.selfReported?.reasons?.[archetype]?.trim();
    return { archetype, confidence: 'strong' as const, declaredBy: 'worker' as const, signals: reason ? [reason.slice(0, 360)] : [] };
  });
}

/** Declared categories replace any keyword guess for the same category. */
export function mergeFlags(declared: CaseFile['flags'], guessed: CaseFile['flags']): CaseFile['flags'] {
  return [...declared, ...guessed.filter(flag => !declared.some(item => item.archetype === flag.archetype))];
}
