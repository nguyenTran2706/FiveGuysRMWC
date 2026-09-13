import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

async function bundle(path) {
  const result = await build({ entryPoints: [fileURLToPath(new URL(path, import.meta.url))], bundle: true, write: false, format: 'esm', platform: 'node' });
  return import('data:text/javascript;base64,' + Buffer.from(result.outputFiles[0].text).toString('base64'));
}
const { residents } = await bundle('../src/data/stories.ts');
const { conversationArtwork, conversationImage, nextConversationImages } = await bundle('../src/data/conversationArtwork.ts');

test('every dialogue beat and both endings have distinct real image assets', async () => {
  const allPaths = [];
  for (const resident of residents) {
    const artwork = conversationArtwork[resident.id];
    assert.deepEqual(Object.keys(artwork.nodes).sort(), Object.keys(resident.nodes).sort());
    assert.equal(artwork.nodes[resident.start], resident.image);
    allPaths.push(...Object.values(artwork.nodes), ...Object.values(artwork.endings));
    for (const node of Object.values(resident.nodes)) {
      assert.equal(conversationImage(resident, node.id, 'dialogue', 'kept'), artwork.nodes[node.id]);
      assert.equal(conversationImage(resident, node.id, 'reflection', 'kept'), artwork.nodes[node.id]);
    }
    for (const ending of ['kept', 'missed']) assert.equal(conversationImage(resident, resident.start, 'epilogue', ending), artwork.endings[ending]);
  }
  assert.equal(allPaths.length, 85);
  assert.equal(new Set(allPaths).size, allPaths.length);
  const hashes = new Set();
  for (const path of allPaths) {
    const bytes = await readFile(new URL('../public' + path, import.meta.url));
    const metadata = await sharp(bytes).metadata();
    assert.equal(metadata.format, 'webp', path);
    assert.equal(metadata.width, 1600, path);
    assert.ok(metadata.height >= 850 && metadata.height <= 950, path);
    assert.ok(bytes.length < 300_000, path + ' exceeds scene size budget');
    hashes.add(createHash('sha256').update(bytes).digest('hex'));
  }
  assert.equal(hashes.size, allPaths.length, 'No renamed duplicate pictures');
});

test('preloading covers immediate branches and endings without downloading every scene', () => {
  for (const resident of residents) {
    const artwork = conversationArtwork[resident.id];
    for (const node of Object.values(resident.nodes)) {
      const expected = node.choices?.length
        ? [...new Set(node.choices.map(choice => artwork.nodes[choice.next]))]
        : !node.next || node.next === 'reflection' || node.next === 'closed'
          ? [artwork.endings[node.next === 'closed' ? 'missed' : 'kept']]
          : [artwork.nodes[node.next]];
      assert.deepEqual(nextConversationImages(resident, node.id, 'kept'), expected);
      assert.ok(expected.length <= 3);
    }
  }
});
