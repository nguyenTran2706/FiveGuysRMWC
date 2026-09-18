import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const root = new URL('../', import.meta.url);
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const manifest = JSON.parse(await readFile(new URL('docs/recording-scripts/manifest.json', root), 'utf8'));
const registry = JSON.parse(await readFile(new URL('src/data/dialogueAudio.generated.json', root), 'utf8')).recordings;
const catalogue = JSON.parse(await readFile(new URL('public/audio/dialogue/catalog.json', root), 'utf8'));

test('all 170 character MP3s exist, are distinct, and are honestly labelled synthetic', async () => {
  assert.equal(manifest.ready, 170);
  assert.equal(Object.keys(registry).length, 170);
  assert.equal(catalogue.ready, 170);
  assert.equal(catalogue.syntheticCount, 170);
  const hashes = new Set();
  for (const cue of manifest.cues) {
    const bytes = await readFile(new URL(`public${cue.src}`, root));
    const review = JSON.parse(await readFile(new URL(cue.reviewFile, root), 'utf8'));
    const audioHash = hash(bytes);
    hashes.add(audioHash);
    assert.equal(review.audioSha256, audioHash, cue.src);
    assert.equal(review.textSha256, hash(cue.text), cue.src);
    assert.equal(review.humanPerformed, false);
    assert.equal(review.production, 'local-synthetic');
    assert.equal(review.technicalValidated, true);
    assert.ok(review.durationSeconds > 1 && review.durationSeconds < 180);
    assert.ok(review.rms > .003 && review.peak < 1);
    assert.equal(review.transcriptionCheck?.audioSha256, audioHash, 'Wording smoke check must cover the current audio');
    assert.equal(review.transcriptionCheck?.flag, false, 'Flagged wording requires investigation, not silent approval');
    assert.ok(bytes.length > 10000 && bytes.length < 12_000_000);
    assert.equal(registry[`${cue.pack}/${cue.character}/${cue.cue}`].text, cue.text);
    assert.equal(registry[`${cue.pack}/${cue.character}/${cue.cue}`].production, 'local-synthetic');
    assert.equal(catalogue.voices.find(voice => voice.character === cue.character && voice.language === cue.language && voice.cue === cue.cue).src, registry[`${cue.pack}/${cue.character}/${cue.cue}`].src);
  }
  assert.equal(hashes.size, 170, 'No renamed duplicates or shared silent placeholders');
});

test('all characters retain one synthesis voice per language across every branch', async () => {
  const identities = new Map();
  for (const cue of manifest.cues) {
    const review = JSON.parse(await readFile(new URL(cue.reviewFile, root), 'utf8'));
    const key = `${cue.character}/${cue.language}`;
    const identity = `${review.model}/${review.voice}/${review.accent}`;
    if (identities.has(key)) assert.equal(identities.get(key), identity, key);
    else identities.set(key, identity);
  }
  assert.equal(identities.size, 14);
  for (const language of ['vi', 'en']) assert.equal(new Set([...identities].filter(([key]) => key.endsWith(`/${language}`)).map(([, value]) => value)).size, 7);
});
