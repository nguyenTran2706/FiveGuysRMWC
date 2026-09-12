import type { Archetype } from '../types';

/**
 * A community warning entry, aggregated by INDUSTRY and SUBURB — never by the name of a business.
 *
 * Naming a business alongside an unverified allegation exposes the operator of this board to a
 * defamation claim, and in workplaces of five or ten people it also tells the employer which of
 * their staff filed the report. Industry plus suburb still warns a jobseeker about where the
 * pattern sits, without either risk. Reports carry fixed pattern tags only, and a month rather
 * than a date.
 */
export type IndustryKey = 'nail_beauty' | 'restaurant_cafe' | 'fast_food' | 'grocery_retail' | 'cleaning' | 'delivery' | 'construction' | 'aged_care' | 'other';

export const industryKeys: IndustryKey[] = ['nail_beauty', 'restaurant_cafe', 'fast_food', 'grocery_retail', 'cleaning', 'delivery', 'construction', 'aged_care', 'other'];

export interface EmployerReport {
  industry: IndustryKey;
  suburb: string;
  patterns: Archetype[];
  /** Month only, never a full date: a precise date could identify the worker who filed it. */
  month: string;
}

export interface EmployerSummary {
  key: string;
  industry: IndustryKey;
  suburb: string;
  reportCount: number;
  /** Patterns ordered by how many reports mention them. */
  patterns: Array<{ archetype: Archetype; count: number }>;
  months: string[];
}

const STORAGE_KEY = 'kyr.employerReports.v2';

/** Sample entries so the board is readable before any real report exists. Clearly marked as samples in the UI. */
export const sampleReports: EmployerReport[] = [
  { industry: 'restaurant_cafe', suburb: 'Cabramatta', patterns: ['underpayment', 'unfair_dismissal'], month: '2026-06' },
  { industry: 'restaurant_cafe', suburb: 'Cabramatta', patterns: ['underpayment'], month: '2026-07' },
  { industry: 'restaurant_cafe', suburb: 'Cabramatta', patterns: ['underpayment', 'bullying'], month: '2026-08' },
  { industry: 'cleaning', suburb: 'Bankstown', patterns: ['sham_contracting', 'underpayment'], month: '2026-05' },
  { industry: 'cleaning', suburb: 'Bankstown', patterns: ['sham_contracting'], month: '2026-08' },
  { industry: 'nail_beauty', suburb: 'Marrickville', patterns: ['underpayment', 'workplace_injury'], month: '2026-07' },
];

export function normalizeText(value: string): string {
  return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
}

export function reportKey(industry: IndustryKey, suburb: string): string {
  return `${industry}::${normalizeText(suburb)}`;
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

/** Removes the most recent report for one industry, suburb and month, so an opt-in can be undone. */
export function removeReport(industry: IndustryKey, suburb: string, month: string): EmployerReport[] {
  const reports = loadReports();
  const index = reports.map(report => reportKey(report.industry, report.suburb) === reportKey(industry, suburb) && report.month === month).lastIndexOf(true);
  const next = index === -1 ? reports : [...reports.slice(0, index), ...reports.slice(index + 1)];
  try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* private browsing: nothing was stored */ }
  return next;
}

export function clearReports(): void {
  try { window.localStorage.removeItem(STORAGE_KEY); } catch { /* nothing to clear */ }
}

/** Groups reports by industry and suburb, and counts how often each pattern comes up. */
export function summarize(reports: EmployerReport[]): EmployerSummary[] {
  const groups = new Map<string, EmployerReport[]>();
  reports.forEach(report => {
    const key = reportKey(report.industry, report.suburb);
    groups.set(key, [...(groups.get(key) ?? []), report]);
  });
  return [...groups.entries()].map(([key, group]) => {
    const counts = new Map<Archetype, number>();
    group.forEach(report => report.patterns.forEach(pattern => counts.set(pattern, (counts.get(pattern) ?? 0) + 1)));
    return {
      key,
      industry: group[0].industry,
      suburb: group[0].suburb,
      reportCount: group.length,
      patterns: [...counts.entries()].map(([archetype, count]) => ({ archetype, count })).sort((a, b) => b.count - a.count),
      months: [...new Set(group.map(report => report.month))].sort(),
    };
  }).sort((a, b) => b.reportCount - a.reportCount);
}

export function searchSummaries(summaries: EmployerSummary[], query: string, industryLabel: (key: IndustryKey) => string): EmployerSummary[] {
  const term = normalizeText(query);
  if (!term) return summaries;
  return summaries.filter(summary => normalizeText(summary.suburb).includes(term) || normalizeText(industryLabel(summary.industry)).includes(term));
}
