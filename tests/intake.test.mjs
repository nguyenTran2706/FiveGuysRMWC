import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';

const result = await build({
  stdin: {
    contents: "export { needsImmediateSupport, flagsFromOwnWords } from './src/components/Intake.tsx'; export { validateCaseFile, plainSummary } from './src/components/Summary.tsx'; export { createCaseFile } from './src/types.ts';",
    resolveDir: fileURLToPath(new URL('../', import.meta.url)),
    loader: 'ts',
  },
  bundle: true, format: 'esm', platform: 'node', write: false,
  loader: { '.css': 'empty' }, logLevel: 'silent',
});
const { needsImmediateSupport, flagsFromOwnWords, validateCaseFile, plainSummary, createCaseFile } = await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`);

test('immediate support recognizes each required English crisis category', () => {
  for (const statement of [
    'I need medical care right now.',
    'My employer threatened to kill me.',
    'I was sexually assaulted.',
    'I have nowhere to sleep tonight.',
    'My boss is holding my passport.',
    'I am not free to leave.',
    'I am in debt bondage.',
  ]) assert.equal(needsImmediateSupport(statement), true, statement);
});

test('immediate support recognizes Vietnamese and mixed-language answers', () => {
  for (const statement of [
    'Tôi cần đi viện ngay.',
    'Chủ dọa đánh tôi.',
    'Tôi bị tấn công tình dục.',
    'Tối nay tôi không có chỗ ngủ.',
    'Chủ đang giữ hộ chiếu của tôi.',
    'Tôi không được rời đi.',
    'Boss won’t let me leave. Tôi sợ lắm.',
  ]) assert.equal(needsImmediateSupport(statement), true, statement);
});

test('ordinary workplace concerns do not trigger a crisis interruption', () => {
  for (const statement of [
    'I am underpaid and never get payslips.',
    'Tôi lo về visa và không có payslip.',
    'I hurt my hand at work last year and it has healed.',
    'I work in aged care.',
  ]) assert.equal(needsImmediateSupport(statement), false, statement);
});

test('flags retain original words, remain possible, and do not assert findings', () => {
  const original = 'Tôi không được trả lương tuần trước';
  const flags = flagsFromOwnWords(original);
  assert.equal(flags.length, 1);
  assert.deepEqual(flags[0], { archetype: 'underpayment', confidence: 'possible', signals: [original] });
  assert.deepEqual(flagsFromOwnWords('I am not underpaid. I am not bullied.'), []);
});

test('valid local drafts pass; missing or wrongly typed required fields fail', () => {
  const file = createCaseFile('vi', 'agent');
  assert.equal(validateCaseFile(file), true);
  assert.equal(validateCaseFile({ ...file, consent: { shareWithRMWC: true } }), false);
  assert.equal(validateCaseFile({ ...file, flags: 'underpayment' }), false);
  assert.equal(validateCaseFile({ ...file, narrative: { vi: [], en: '' } }), false);
  assert.equal(validateCaseFile({ ...file, profile: { tenureMonths: -3 } }), false);
  assert.equal(validateCaseFile({ ...file, status: 'submitted' }), false);
  assert.equal(validateCaseFile({ ...file, contactSafety: { safeToLeaveVoicemail: 'false' } }), false);
  assert.equal(validateCaseFile({ ...file, detail: { harassment: { byWhom: 5 } } }), false);
});

test('bilingual summaries keep original free text and do not invent missing facts', () => {
  const file = createCaseFile('vi', 'agent');
  file.narrative.vi = 'Tôi làm bếp, manager không gửi roster.';
  file.profile.role = 'Phụ bếp';
  file.contactSafety.safeToLeaveVoicemail = false;
  const english = plainSummary(file, 'en');
  assert.ok(english.includes(file.narrative.vi));
  assert.ok(english.includes('Phụ bếp'));
  assert.ok(english.includes('No verified translation has been provided.'));
  assert.ok(english.includes('Visa type: Not provided'));
  assert.ok(english.includes('Is it safe to leave a voicemail message?: No'));
  assert.equal(file.narrative.en, '');
});
