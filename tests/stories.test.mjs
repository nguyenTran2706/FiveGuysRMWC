import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';

const bundle = await build({ entryPoints: [fileURLToPath(new URL('../src/data/stories.ts', import.meta.url))], bundle: true, write: false, format: 'esm', platform: 'node' });
const { residents } = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString('base64')}`);

test('every story branch resolves, all content is bilingual, and safety gates exist', () => {
  assert.equal(residents.length, 7);
  assert.equal(new Set(residents.map(resident => resident.archetype)).size, 7);
  assert.equal(residents.filter(resident => resident.needsReturn).length, 2);
  assert.ok(residents.find(resident => resident.id === 'tram').warning);
  assert.ok(residents.find(resident => resident.id === 'mai').warning);
  for (const resident of residents) {
    assert.ok(resident.nodes[resident.start]);
    const visited = new Set();
    function visit(id, chain = new Set()) {
      assert.ok(!chain.has(id), `${resident.id}: cyclic story path ${id}`);
      const node = resident.nodes[id];
      assert.ok(node, `${resident.id}: missing node ${id}`);
      visited.add(id);
      assert.ok(node.text.vi.trim() && node.text.en.trim());
      const newChain = new Set([...chain, id]);
      if (node.choices?.length) {
        for (const choice of node.choices) {
          assert.ok(choice.text.vi.trim() && choice.text.en.trim());
          visit(choice.next, newChain);
        }
      } else if (node.next !== 'reflection' && node.next !== 'closed') visit(node.next, newChain);
    }
    visit(resident.start);
    assert.equal(visited.size, Object.keys(resident.nodes).length, `${resident.id}: unreachable nodes`);
  }
});

test('each resident has a distinct evidence choice and consequential fictional ending', () => {
  for (const resident of residents) {
    const choices = Object.values(resident.nodes).flatMap(node => node.choices ?? []);
    assert.ok(choices.some(choice => choice.recordEvidence), `${resident.id}: missing evidence choice`);
    assert.ok(choices.some(choice => (choice.trust ?? 0) < 0), `${resident.id}: no consequence for pushy response`);
    assert.notEqual(resident.epilogue.kept.vi, resident.epilogue.missed.vi);
    assert.notEqual(resident.epilogue.kept.en, resident.epilogue.missed.en);
    assert.match(resident.epilogue.kept.en, /fictional/i);
  }
});
