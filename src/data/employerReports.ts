import type { Archetype } from '../types';

/**
 * A community warning entry. Reports carry FIXED pattern tags only — never free text about a
 * named employer — so the board cannot be used to publish an accusation about a person.
 */
export interface EmployerReport {
  employer: string;
  suburb?: string;
  patterns: Archetype[];
  /** Month only, never a full date: a precise date could identify the worker who filed it. */
  month: string;
}

export interface EmployerSummary {
  employer: string;
  suburbs: string[];
  reportCount: number;
  /** Patterns ordered by how many reports mention them. */
  patterns: Array<{ archetype: Archetype; count: number }>;
  months: string[];
}

const STORAGE_KEY = 'kyr.employerReports.v1';

/** Sample entries so the board is readable before any real report exists. Clearly marked as samples in the UI. */
export const sampleReports: EmployerReport[] = [
  { employer: 'Pho Ha Noi Restaurant', suburb: 'Cabramatta', patterns: ['underpayment', 'unfair_dismissal'], month: '2026-06' },
  { employer: 'Pho Ha Noi Restaurant', suburb: 'Cabramatta', patterns: ['underpayment'], month: '2026-07' },
  { employer: 'Pho Ha Noi Restaurant', suburb: 'Cabramatta', patterns: ['underpayment', 'bullying'], month: '2026-08' },
  { employer: 'Sunrise Cleaning Services', suburb: 'Bankstown', patterns: ['sham_contracting', 'underpayment'], month: '2026-05' },
  { employer: 'Sunrise Cleaning Services', suburb: 'Marrickville', patterns: ['sham_contracting'], month: '2026-08' },
  { employer: 'Golden Nail Bar', suburb: 'Marrickville', patterns: ['underpayment', 'workplace_injury'], month: '2026-07' },
];

export function normalizeEmployer(value: string): string {
  return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
}

export function loadReports(): EmployerReport[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as EmployerReport[]) : [];
  } catch {
    return [];
  }
}

export function saveReport(report: EmployerReport): EmployerReport[] {
  const next = [...loadReports(), report];
  try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* private browsing: the report stays in memory only */ }
  return next;
}

/** Removes the most recent report for one workplace and month, so an opt-in can be undone. */
export function removeReport(employer: string, month: string): EmployerReport[] {
  const reports = loadReports();
  const index = reports.map(report => normalizeEmployer(report.employer) === normalizeEmployer(employer) && report.month === month).lastIndexOf(true);
  const next = index === -1 ? reports : [...reports.slice(0, index), ...reports.slice(index + 1)];
  try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* private browsing: nothing was stored */ }
  return next;
}

export function clearReports(): void {
  try { window.localStorage.removeItem(STORAGE_KEY); } catch { /* nothing to clear */ }
}

/** Groups reports by employer name and counts how often each pattern comes up. */
export function summarize(reports: EmployerReport[]): EmployerSummary[] {
  const groups = new Map<string, EmployerReport[]>();
  reports.forEach(report => {
    const key = normalizeEmployer(report.employer);
    if (!key) return;
    groups.set(key, [...(groups.get(key) ?? []), report]);
  });
  return [...groups.values()].map(group => {
    const counts = new Map<Archetype, number>();
    group.forEach(report => report.patterns.forEach(pattern => counts.set(pattern, (counts.get(pattern) ?? 0) + 1)));
    return {
      employer: group[0].employer,
      suburbs: [...new Set(group.map(report => report.suburb).filter((value): value is string => Boolean(value?.trim())))],
      reportCount: group.length,
      patterns: [...counts.entries()].map(([archetype, count]) => ({ archetype, count })).sort((a, b) => b.count - a.count),
      months: [...new Set(group.map(report => report.month))].sort(),
    };
  }).sort((a, b) => b.reportCount - a.reportCount);
}

export function searchSummaries(summaries: EmployerSummary[], query: string): EmployerSummary[] {
  const term = normalizeEmployer(query);
  if (!term) return summaries;
  return summaries.filter(summary => normalizeEmployer(summary.employer).includes(term) || summary.suburbs.some(suburb => normalizeEmployer(suburb).includes(term)));
}
