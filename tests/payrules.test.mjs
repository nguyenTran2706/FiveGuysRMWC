import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';

const result = await build({
  stdin: {
    contents: "export { assessPay, lawfulHourlyRate, awardRates } from './src/data/payRules.ts';",
    resolveDir: fileURLToPath(new URL('../', import.meta.url)),
    loader: 'ts',
  },
  bundle: true, format: 'esm', platform: 'node', write: false,
  loader: { '.css': 'empty' }, logLevel: 'silent',
});
const { assessPay, lawfulHourlyRate, awardRates } = await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`);

test('casual loading is added to the award base rate', () => {
  assert.equal(lawfulHourlyRate('general', 'casual'), 33.05);
  assert.equal(lawfulHourlyRate('retail', 'full_time'), awardRates.retail.baseHourly);
});

test('underpayment with overtime produces a weekly shortfall', () => {
  const assessment = assessPay({ award: 'hospitality', employmentBasis: 'casual', hourlyRate: 18, hoursPerWeek: 45 });
  assert.equal(assessment.overtimeHours, 7);
  assert.ok(assessment.shortfallPerWeek > 0);
  assert.deepEqual(assessment.findings.map(finding => finding.code).sort(), ['below_base', 'overtime_unpaid']);
});

test('lawful pay reports no shortfall and unpaid super is quantified', () => {
  const assessment = assessPay({ award: 'general', employmentBasis: 'full_time', hourlyRate: 30, hoursPerWeek: 38, superPaid: 'no' });
  assert.equal(assessment.shortfallPerWeek, 0);
  assert.equal(assessment.superOwedPerWeek, 136.8);
  assert.ok(assessment.findings.some(finding => finding.code === 'at_or_above_base'));
});

test('no pay answers means no comparison', () => {
  assert.equal(assessPay({}), null);
});
