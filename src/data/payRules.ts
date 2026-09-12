import type { Language, Localized } from '../types';

/**
 * Deterministic pay rules engine.
 *
 * It compares what a worker reports against the minimum they should be getting:
 * award / national minimum base rate, casual loading, overtime penalties and
 * superannuation. The rates below are published minimums, stored with the date
 * they took effect. Nothing here is legal advice or a legal assessment — every
 * result points back to the Fair Work Pay Calculator and to RMWC.
 */

export const RATES_EFFECTIVE_FROM = '2026-07-01';
export const FAIR_WORK_CALCULATOR_URL = 'https://calculate.fairwork.gov.au/findyouraward';

/** National Minimum Wage, from 1 July 2026 (38 ordinary hours per week). */
export const NATIONAL_MINIMUM_WAGE_HOURLY = 26.44;
export const ORDINARY_HOURS_PER_WEEK = 38;
export const CASUAL_LOADING = 0.25;
export const SUPER_GUARANTEE_RATE = 0.12;
/** Simplified weekly overtime: first two overtime hours at 150%, the rest at 200%. */
export const OVERTIME_FIRST_HOURS = 2;

export type AwardKey = 'hospitality' | 'restaurant' | 'fast_food' | 'retail' | 'cleaning' | 'general';
export type EmploymentBasis = 'casual' | 'part_time' | 'full_time';

export interface AwardRate {
  code: string;
  name: Localized;
  /** Level 1 / introductory adult base rate for full-time and part-time employees. */
  baseHourly: number;
}

export const awardRates: Record<AwardKey, AwardRate> = {
  hospitality: { code: 'MA000009', name: { vi: 'Ngành khách sạn / nhà hàng khách sạn', en: 'Hospitality Industry Award' }, baseHourly: 26.44 },
  restaurant: { code: 'MA000119', name: { vi: 'Nhà hàng, quán ăn', en: 'Restaurant Industry Award' }, baseHourly: 26.44 },
  fast_food: { code: 'MA000003', name: { vi: 'Thức ăn nhanh', en: 'Fast Food Industry Award' }, baseHourly: 26.44 },
  retail: { code: 'MA000004', name: { vi: 'Bán lẻ', en: 'General Retail Industry Award' }, baseHourly: 27.81 },
  cleaning: { code: 'MA000022', name: { vi: 'Dịch vụ vệ sinh', en: 'Cleaning Services Award' }, baseHourly: 27.08 },
  general: { code: 'NMW', name: { vi: 'Mức lương tối thiểu quốc gia', en: 'National Minimum Wage' }, baseHourly: NATIONAL_MINIMUM_WAGE_HOURLY },
};

export interface PayReport {
  award?: AwardKey;
  employmentBasis?: EmploymentBasis;
  hourlyRate?: number;
  hoursPerWeek?: number;
  superPaid?: 'yes' | 'no' | 'unknown';
  paidCash?: boolean;
}

export type PayFindingCode =
  | 'below_base' | 'at_or_above_base' | 'casual_loading_missing' | 'overtime_unpaid'
  | 'super_missing' | 'super_unknown' | 'cash_no_payslip';

export interface PayFinding { code: PayFindingCode; amountPerWeek?: number }

export interface PayAssessment {
  /** The lawful minimum hourly rate for the reported basis, casual loading included. */
  lawfulHourly: number;
  reportedHourly?: number;
  ordinaryHours: number;
  overtimeHours: number;
  expectedWeeklyPay?: number;
  reportedWeeklyPay?: number;
  shortfallPerWeek?: number;
  superOwedPerWeek?: number;
  findings: PayFinding[];
}

const round = (value: number) => Math.round(value * 100) / 100;

export function lawfulHourlyRate(award: AwardKey = 'general', basis: EmploymentBasis = 'casual'): number {
  const base = awardRates[award].baseHourly;
  return round(basis === 'casual' ? base * (1 + CASUAL_LOADING) : base);
}

/** Pure, deterministic comparison. Missing answers simply produce fewer findings. */
export function assessPay(report: PayReport): PayAssessment | null {
  const { hourlyRate, hoursPerWeek } = report;
  if (hourlyRate === undefined && hoursPerWeek === undefined && report.superPaid === undefined) return null;
  const basis = report.employmentBasis ?? 'casual';
  const award = report.award ?? 'general';
  const base = awardRates[award].baseHourly;
  const lawfulHourly = lawfulHourlyRate(award, basis);
  const totalHours = hoursPerWeek !== undefined && hoursPerWeek > 0 ? hoursPerWeek : undefined;
  const ordinaryHours = totalHours === undefined ? 0 : Math.min(totalHours, ORDINARY_HOURS_PER_WEEK);
  const overtimeHours = totalHours === undefined ? 0 : Math.max(0, totalHours - ORDINARY_HOURS_PER_WEEK);
  const findings: PayFinding[] = [];

  let expectedWeeklyPay: number | undefined;
  let reportedWeeklyPay: number | undefined;
  let shortfallPerWeek: number | undefined;
  if (totalHours !== undefined) {
    const overtimeFirst = Math.min(overtimeHours, OVERTIME_FIRST_HOURS);
    const overtimeRest = Math.max(0, overtimeHours - OVERTIME_FIRST_HOURS);
    expectedWeeklyPay = round(ordinaryHours * lawfulHourly + overtimeFirst * base * 1.5 + overtimeRest * base * 2);
    if (hourlyRate !== undefined) {
      reportedWeeklyPay = round(totalHours * hourlyRate);
      shortfallPerWeek = round(Math.max(0, expectedWeeklyPay - reportedWeeklyPay));
    }
  }

  if (hourlyRate !== undefined) {
    if (hourlyRate < lawfulHourly) findings.push({ code: 'below_base', amountPerWeek: shortfallPerWeek });
    else findings.push({ code: 'at_or_above_base' });
    if (basis === 'casual' && hourlyRate >= base && hourlyRate < lawfulHourly) findings.push({ code: 'casual_loading_missing' });
  }
  if (overtimeHours > 0 && hourlyRate !== undefined && shortfallPerWeek !== undefined && shortfallPerWeek > 0) {
    findings.push({ code: 'overtime_unpaid', amountPerWeek: shortfallPerWeek });
  }

  let superOwedPerWeek: number | undefined;
  const superBase = reportedWeeklyPay ?? expectedWeeklyPay;
  if (report.superPaid === 'no' && superBase !== undefined) {
    superOwedPerWeek = round(superBase * SUPER_GUARANTEE_RATE);
    findings.push({ code: 'super_missing', amountPerWeek: superOwedPerWeek });
  } else if (report.superPaid === 'unknown') findings.push({ code: 'super_unknown' });
  if (report.paidCash === true) findings.push({ code: 'cash_no_payslip' });

  return { lawfulHourly, reportedHourly: hourlyRate, ordinaryHours, overtimeHours, expectedWeeklyPay, reportedWeeklyPay, shortfallPerWeek, superOwedPerWeek, findings };
}

export const payFindingText: Record<PayFindingCode, Localized> = {
  below_base: { vi: 'Mức lương bạn cho biết thấp hơn mức tối thiểu áp dụng.', en: 'The rate you reported is below the applicable minimum rate.' },
  at_or_above_base: { vi: 'Mức lương bạn cho biết bằng hoặc cao hơn mức cơ bản tối thiểu. Vẫn nên kiểm tra phụ cấp cuối tuần, ngày lễ và làm đêm.', en: 'Your reported rate meets or exceeds the minimum base rate. Weekend, public holiday and evening penalties may still apply.' },
  casual_loading_missing: { vi: 'Người làm casual thường được cộng thêm 25% (casual loading). Phần này có thể đang thiếu.', en: 'Casual employees are usually paid a 25% casual loading. That loading appears to be missing.' },
  overtime_unpaid: { vi: 'Số giờ vượt quá 38 giờ/tuần thường được tính phụ cấp làm thêm giờ.', en: 'Hours beyond 38 per week normally attract overtime penalty rates.' },
  super_missing: { vi: 'Hầu hết người lao động được đóng quỹ hưu trí (superannuation) 12%.', en: 'Most employees are entitled to 12% superannuation contributions.' },
  super_unknown: { vi: 'Bạn có thể kiểm tra quỹ hưu trí qua myGov hoặc ATO.', en: 'You can check superannuation payments through myGov or the ATO.' },
  cash_no_payslip: { vi: 'Trả bằng tiền mặt không sai luật, nhưng bạn vẫn phải được nhận phiếu lương và đóng hưu trí.', en: 'Being paid cash is not unlawful, but you must still receive payslips and superannuation.' },
};

export function payCopy(language: Language) {
  return {
    title: language === 'vi' ? 'So sánh lương của bạn với mức tối thiểu' : 'Your pay compared with the minimum',
    note: language === 'vi'
      ? `Bảng so sánh tự động dựa trên mức tối thiểu công bố (áp dụng từ 01/07/2026) và những gì bạn ghi. Đây là ước tính, không phải tư vấn pháp lý; bậc lương, phụ cấp và ngày lễ có thể làm số thay đổi.`
      : `An automatic comparison using published minimum rates (effective 1 July 2026) and what you entered. It is an estimate, not legal advice; classification levels, penalties and public holidays can change the figures.`,
    lawfulHourly: language === 'vi' ? 'Mức tối thiểu mỗi giờ' : 'Minimum hourly rate',
    reportedHourly: language === 'vi' ? 'Mức bạn cho biết' : 'Rate you reported',
    expected: language === 'vi' ? 'Ước tính nên nhận mỗi tuần' : 'Estimated weekly entitlement',
    reported: language === 'vi' ? 'Ước tính đang nhận mỗi tuần' : 'Estimated weekly pay reported',
    shortfall: language === 'vi' ? 'Khoản có thể bị thiếu mỗi tuần' : 'Possible weekly shortfall',
    superOwed: language === 'vi' ? 'Hưu trí có thể bị thiếu mỗi tuần' : 'Possible weekly superannuation',
    overtime: language === 'vi' ? 'Giờ làm thêm mỗi tuần' : 'Overtime hours per week',
    award: language === 'vi' ? 'Award dùng để so sánh' : 'Award used for comparison',
    empty: language === 'vi' ? 'Chưa đủ thông tin về lương để so sánh.' : 'Not enough pay information to compare yet.',
    calculator: language === 'vi' ? 'Kiểm tra bằng Fair Work Pay Calculator' : 'Check with the Fair Work Pay Calculator',
  };
}

export const money = (value: number) => `$${value.toFixed(2)}`;
