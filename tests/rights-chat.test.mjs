import test from 'node:test';
import assert from 'node:assert/strict';
import { answerQuestion, buildPrompt, REFUSAL, GREETING, isUnusable, looksVietnamese } from '../src/lib/rightsAnswer.mjs';
import { retrieve, knowledgeBase } from '../src/lib/retrieval.mjs';

const echoModel = ({ user }) => `Answer grounded in: ${user.slice(0, 40)}`;

test('knowledge base entries are bilingual and carry a Fair Work source', () => {
  assert.ok(knowledgeBase.entries.length >= 10);
  for (const entry of knowledgeBase.entries) {
    for (const field of ['title', 'starter', 'text']) {
      assert.ok(entry[field].en?.length > 3, `${entry.id}: missing English ${field}`);
      assert.ok(entry[field].vi?.length > 3, `${entry.id}: missing Vietnamese ${field}`);
    }
    assert.match(entry.source.url, /^https:\/\/www\.fairwork\.gov\.au\//);
    assert.ok(knowledgeBase.topics.some(topic => topic.id === entry.topic), `${entry.id}: unknown topic`);
  }
  assert.match(knowledgeBase.checked, /^\d{4}-\d{2}-\d{2}$/);
});

test('in-scope questions retrieve passages and the answer cites their sources', async () => {
  for (const [question, expectedId] of [
    ['What is the minimum wage in Australia?', 'minimum-wage'],
    ['My boss never gives me a pay slip', 'pay-slips'],
    ['How much notice must my employer give me?', 'notice-of-termination'],
    ['Do I still have rights if I breached my student visa condition?', 'migrant-protections'],
  ]) {
    const { grounded, passages } = retrieve(question);
    assert.ok(grounded, `${question}: expected grounded retrieval`);
    assert.equal(passages[0].id, expectedId);
    const result = await answerQuestion(question, 'en', echoModel);
    assert.equal(result.grounded, true);
    assert.ok(result.sources.length > 0);
    for (const source of result.sources) assert.match(source.url, /fairwork\.gov\.au/);
  }
});

test('out-of-scope questions refuse and suggest covered topics, in the user language', async () => {
  const model = () => { throw new Error('model must not be called without passages'); };
  for (const question of ['How do I cook pho?', 'What is the weather in Sydney tomorrow?', 'Can I get a home loan?']) {
    const result = await answerQuestion(question, 'en', model);
    assert.equal(result.grounded, false);
    assert.equal(result.answer, REFUSAL.en);
    assert.ok(result.suggestions.length >= 3);
    assert.equal(result.sources.length, 0);
  }
  const vietnamese = await answerQuestion('Thời tiết Sydney mai thế nào?', 'vi', model);
  assert.equal(vietnamese.answer, REFUSAL.vi);
});

test('a covered question never refuses because of weak model output', async () => {
  for (const output of ['INSUFFICIENT_CONTEXT', 'Insufficient context.', "I cannot answer that.", '']) {
    const result = await answerQuestion('My boss never gives me pay slip.', 'en', () => output);
    assert.equal(result.kind, 'answer', `model output ${JSON.stringify(output)} must not cause a refusal`);
    assert.notEqual(result.answer, REFUSAL.en);
    assert.ok(result.answer.length > 60, 'falls back to the curated passage text');
    assert.ok(result.sources.some(source => source.url.includes('pay-slips')));
  }
  assert.ok(isUnusable('Insufficient context.'));
  assert.ok(!isUnusable('An employer must give an employee a pay slip within 1 working day of pay day, even on leave.'));
});

test('common real-world phrasings reach the right passage', async () => {
  const cases = [
    ['My boss never gives me pay slip.', 'pay-slips'],
    ['boss not paying overtime', 'minimum-wage'],
    ['I got sacked yesterday', 'notice-of-termination'],
    ['My manager makes fun of my accent', 'discrimination'],
  ];
  for (const [question, expectedId] of cases) {
    const { grounded, passages } = retrieve(question);
    assert.ok(grounded, `${question}: expected a grounded match`);
    assert.ok(passages.some(passage => passage.id === expectedId), `${question}: expected ${expectedId}, got ${passages.map(p => p.id).join(', ')}`);
  }
});

test('a Vietnamese question is never answered in English', async () => {
  const english = 'An employer must give an employee a pay slip within 1 working day of pay day, even on leave.';
  const result = await answerQuestion('Chủ không đưa phiếu lương cho tôi.', 'vi', () => english);
  assert.equal(result.kind, 'answer');
  assert.notEqual(result.answer, english, 'an English answer must be replaced by the Vietnamese passage');
  assert.ok(looksVietnamese(result.answer));

  // A genuine Vietnamese answer from the model is kept as-is.
  const vietnamese = 'Chủ lao động phải đưa phiếu lương trong vòng 1 ngày làm việc sau ngày trả lương, kể cả khi bạn đang nghỉ phép.';
  const kept = await answerQuestion('Chủ không đưa phiếu lương cho tôi.', 'vi', () => vietnamese);
  assert.equal(kept.answer, vietnamese);

  // English requests are unaffected.
  const en = await answerQuestion('My boss never gives me pay slip.', 'en', () => english);
  assert.equal(en.answer, english);
  assert.ok(!looksVietnamese(english));
  assert.match(buildPrompt('x', 'vi', retrieve('pay slip').passages).system, /ENTIRE answer in Vietnamese/);
});

test('greetings get a welcome with topic suggestions, never the refusal and never the model', async () => {
  const model = () => { throw new Error('model must not be called for a greeting'); };
  for (const greeting of ['hello', 'Hi!', 'good morning', 'thanks', 'xin chào', 'Chào bạn']) {
    const result = await answerQuestion(greeting, 'en', model);
    assert.equal(result.kind, 'greeting', `${greeting}: expected a greeting reply`);
    assert.notEqual(result.answer, REFUSAL.en);
    assert.ok(result.suggestions.length >= 3);
  }
  const vietnamese = await answerQuestion('xin chào', 'vi', model);
  assert.equal(vietnamese.answer, GREETING.vi);
  assert.equal((await answerQuestion('Hello, how much annual leave do I get?', 'en', () => 'grounded reply')).kind, 'answer');
});

test('the prompt forbids outside knowledge, refusals and judging the user\'s case', async () => {
  const { passages } = retrieve('What is the minimum wage?');
  const prompt = buildPrompt('What is the minimum wage?', 'vi', passages);
  assert.match(prompt.system, /ONLY use the numbered passages/);
  assert.match(prompt.system, /Never say you lack context/);
  assert.match(prompt.system, /Never judge the user/);
  assert.match(prompt.system, /Vietnamese/);
  assert.ok(prompt.user.includes(passages[0].source.url));

  // Off-topic questions still refuse without ever reaching the model.
  const offTopic = await answerQuestion('How do I cook pho?', 'en', () => { throw new Error('model must not be called'); });
  assert.equal(offTopic.kind, 'refusal');
  assert.equal(offTopic.answer, REFUSAL.en);
  assert.deepEqual(offTopic.sources, []);
});
