import { ArrowRight, Calculator } from 'lucide-react';
import type { CaseFile, Language } from '../types';
import { assessPay, awardRates, FAIR_WORK_CALCULATOR_URL, money, payCopy, payFindingText } from '../data/payRules';

/** Shows the rules-engine comparison: what was reported against the published minimums. */
export default function PayComparison({ language, caseFile }: { language: Language; caseFile: CaseFile }) {
  const copy = payCopy(language);
  const assessment = assessPay(caseFile.pay ?? {});
  const rows: Array<[string, string]> = [];
  if (assessment) {
    rows.push([copy.award, `${awardRates[caseFile.pay?.award ?? 'general'].name[language]} · ${awardRates[caseFile.pay?.award ?? 'general'].code}`]);
    rows.push([copy.lawfulHourly, money(assessment.lawfulHourly)]);
    if (assessment.reportedHourly !== undefined) rows.push([copy.reportedHourly, money(assessment.reportedHourly)]);
    if (assessment.overtimeHours > 0) rows.push([copy.overtime, `${assessment.overtimeHours}`]);
    if (assessment.expectedWeeklyPay !== undefined) rows.push([copy.expected, money(assessment.expectedWeeklyPay)]);
    if (assessment.reportedWeeklyPay !== undefined) rows.push([copy.reported, money(assessment.reportedWeeklyPay)]);
    if (assessment.shortfallPerWeek !== undefined) rows.push([copy.shortfall, money(assessment.shortfallPerWeek)]);
    if (assessment.superOwedPerWeek !== undefined) rows.push([copy.superOwed, money(assessment.superOwedPerWeek)]);
  }

  return <section className="summary-section">
    <div className="summary-section-heading"><Calculator size={20} /><div><h2>{copy.title}</h2><p>{copy.note}</p></div></div>
    {assessment ? <>
      <dl className="summary-facts">{rows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
      <ul className="summary-pay-findings">{assessment.findings.map(finding => <li key={finding.code}>{payFindingText[finding.code][language]}</li>)}</ul>
    </> : <p className="summary-empty">{copy.empty}</p>}
    <a className="summary-pay-link" href={FAIR_WORK_CALCULATOR_URL} target="_blank" rel="noopener noreferrer">{copy.calculator}<ArrowRight size={14} /></a>
  </section>;
}
