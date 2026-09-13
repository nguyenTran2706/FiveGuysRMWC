import test from 'node:test';
import assert from 'node:assert/strict';
import { answerQuestion, buildPrompt, REFUSAL } from '../api/rightsChat.mjs';
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

test('no answer text survives without a retrieved passage, and the prompt forbids outside knowledge', async () => {
  const insufficient = await answerQuestion('What is the minimum wage?', 'en', () => 'INSUFFICIENT_CONTEXT');
  assert.equal(insufficient.grounded, false);
  assert.equal(insufficient.answer, REFUSAL.en);

  const empty = await answerQuestion('What is the minimum wage?', 'en', () => '');
  assert.equal(empty.grounded, false);

  const { passages } = retrieve('What is the minimum wage?');
  const prompt = buildPrompt('What is the minimum wage?', 'vi', passages);
  assert.match(prompt.system, /ONLY use the numbered passages/);
  assert.match(prompt.system, /INSUFFICIENT_CONTEXT/);
  assert.match(prompt.system, /Vietnamese/);
  assert.ok(prompt.user.includes(passages[0].source.url));
});
