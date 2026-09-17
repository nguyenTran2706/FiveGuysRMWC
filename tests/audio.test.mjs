import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';

async function bundle(path) {
  const result = await build({ entryPoints: [fileURLToPath(new URL(path, import.meta.url))], bundle: true, write: false, format: 'esm', platform: 'node' });
  return import('data:text/javascript;base64,' + Buffer.from(result.outputFiles[0].text).toString('base64'));
}
const { residents } = await bundle('../src/data/stories.ts');
const { characterVoices, assignedVoice } = await bundle('../src/data/characterVoices.ts');
const { tensionAfterChoice, rainMix, INITIAL_TENSION } = await bundle('../src/lib/weather.ts');
const { recordings, recordingKey, dialogueRecording, nextDialogueRecordings } = await bundle('../src/data/dialogueAudio.ts');
const { StoryAudio } = await bundle('../src/lib/storyAudio.ts');
const manifest = JSON.parse(await readFile(new URL('../docs/recording-scripts/manifest.json', import.meta.url), 'utf8'));

test('all 170 cues and both endings have exact scripts and fixed regional casting', () => {
  assert.equal(manifest.total, 170);
  assert.equal(manifest.cues.length, 170);
  assert.equal(new Set(manifest.cues.map(cue => cue.src)).size, 170);
  for (const language of ['vi', 'en']) assert.equal(new Set(residents.map(resident => assignedVoice(resident.id, language))).size, 3);
  for (const resident of residents) for (const language of ['vi', 'en']) {
    assert.ok(characterVoices[resident.id]);
    const expected = [...Object.values(resident.nodes), ...['kept', 'missed'].map(ending => ({ id: `ending-${ending}`, text: resident.epilogue[ending] }))];
    for (const node of expected) {
      const cue = manifest.cues.find(item => item.character === resident.id && item.language === language && item.cue === node.id);
      assert.ok(cue);
      assert.equal(cue.pack, assignedVoice(resident.id, language));
      assert.equal(cue.text, node.text[language]);
      assert.equal(cue.textSha256, createHash('sha256').update(cue.text).digest('hex'));
      assert.equal(cue.src, `/audio/dialogue/${recordingKey(resident.id, node.id, language)}.mp3`);
    }
  }
});

test('missing and stale recordings never fall back to synthesis; preload is bounded', () => {
  const key = recordingKey('linh', 'hello', 'vi');
  const previous = recordings[key];
  try {
    recordings[key] = { text: 'reviewed caption', src: '/fixture.mp3', sha256: 'test-only' };
    assert.equal(dialogueRecording('linh', 'hello', 'vi', 'reviewed caption'), '/fixture.mp3');
    assert.equal(dialogueRecording('linh', 'hello', 'vi', 'changed caption'), null);
    assert.equal(dialogueRecording('unknown', 'hello', 'vi', 'missing'), null);
    for (const resident of residents) for (const cue of Object.keys(resident.nodes)) assert.ok(nextDialogueRecordings(resident, cue, 'vi').length <= 3);
  } finally { if (previous) recordings[key] = previous; else delete recordings[key]; }
});

test('weather calms, escalates gradually, clamps, and can remain steady', () => {
  assert.equal(tensionAfterChoice(INITIAL_TENSION, {}), INITIAL_TENSION);
  assert.ok(tensionAfterChoice(.4, { trust: 1 }) < .4);
  assert.ok(tensionAfterChoice(.4, { trust: -1 }) > .4);
  assert.ok(tensionAfterChoice(.4, { trust: 1, recordEvidence: true }) < tensionAfterChoice(.4, { trust: 1 }));
  assert.equal(tensionAfterChoice(.95, { trust: -2 }), 1);
  assert.equal(tensionAfterChoice(.02, { trust: 1 }), 0);
  assert.equal(rainMix(.6).thunder, 0);
  assert.ok(rainMix(1).thunder <= .1);
  assert.ok(rainMix(1).heavy > rainMix(0).heavy);
  assert.ok(rainMix(1).calm < rainMix(0).calm);
  assert.deepEqual(rainMix(0, false), rainMix(1, false));
});

test('bundled real recordings have distinct known provenance and bounded size', async () => {
  const hashes = {
    calm: '6ff0c10eefb6b6de94c5bf83fe934ca2382889734719741ecbf82fd05ed4f51d',
    heavy: '5c67d3f347a990446e0027a1ceb990f0fbb4cf82f4cedca2b528c64a96ddab50',
    thunder: '056c5296303887b650e62a6dc3282f327f8a8560c061acbf577c5e0734acdb6e',
  };
  for (const [layer, hash] of Object.entries(hashes)) {
    const bytes = await readFile(new URL(`../public/audio/ambience/rain-${layer}.mp3`, import.meta.url));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), hash);
    assert.ok(bytes.length > 100000 && bytes.length < 12_000_000);
  }
});

// Test-only audio graph: validates ownership/envelopes, not realism or accents.
class Param {
  value = 0; ramps = [];
  cancelAndHoldAtTime() {}
  linearRampToValueAtTime(value, time) { this.value = value; this.ramps.push([value, time]); }
}
class Node {
  gain = new Param(); frequency = new Param(); stopped = false; disconnected = false;
  connect(other) { return other; }
  disconnect() { this.disconnected = true; }
  start() { this.started = true; }
  stop() { this.stopped = true; }
}
function buffer(channels = 1, length = 100, sampleRate = 20) {
  const data = Array.from({ length: channels }, () => new Float32Array(length).fill(.1));
  return { duration: length / sampleRate, numberOfChannels: channels, length, sampleRate, getChannelData: i => data[i] };
}
class Context {
  static instances = []; state = 'running'; currentTime = 10; sampleRate = 20; destination = {}; gains = []; sources = [];
  constructor() { Context.instances.push(this); }
  createGain() { const node = new Node(); this.gains.push(node); return node; }
  createBufferSource() { const node = new Node(); this.sources.push(node); return node; }
  createBiquadFilter() { return new Node(); }
  createBuffer(...args) { return buffer(...args); }
  async decodeAudioData() { return buffer(); }
  async resume() { this.state = 'running'; }
  async close() { this.state = 'closed'; }
}
function fixture(t, fetcher = async () => ({ ok: true, arrayBuffer: async () => new ArrayBuffer(1024) })) {
  t.mock.method(globalThis, 'fetch', fetcher);
  const original = globalThis.AudioContext;
  globalThis.AudioContext = Context;
  t.after(() => { if (original) globalThis.AudioContext = original; else delete globalThis.AudioContext; });
  const engine = new StoryAudio();
  t.after(() => engine.dispose());
  let state;
  engine.subscribe(value => { state = value; });
  return { engine, state: () => state };
}

test('late downloads cannot revive a skipped line; replay stops its predecessor', async t => {
  let release;
  const { engine, state } = fixture(t, src => src === '/slow' ? new Promise(resolve => { release = resolve; }) : Promise.resolve({ ok: true, arrayBuffer: async () => new ArrayBuffer(512) }));
  const old = engine.playVoice('/slow');
  await engine.playVoice('/next');
  const context = Context.instances.at(-1);
  assert.equal(state().voice, 'playing');
  release({ ok: true, arrayBuffer: async () => new ArrayBuffer(512) });
  await old;
  assert.equal(context.sources.length, 1);
  await engine.playVoice('/next');
  assert.equal(context.sources[0].stopped, true);
  assert.equal(context.sources.length, 2);
  engine.stopAll();
  assert.ok(context.sources.every(source => source.stopped));
});

test('voice ducks rain and volumes/mute remain independent; ending restores rain', async t => {
  const { engine, state } = fixture(t);
  engine.unlock();
  const context = Context.instances.at(-1);
  engine.setVolumes(.8, .5);
  await engine.startRain();
  assert.equal(state().rain, 'playing');
  assert.equal(context.sources.filter(source => source.loop).length, 3);
  engine.setWeather(1, true);
  assert.deepEqual(context.gains[3].gain.ramps.at(-1), [.46, 15]);
  await engine.playVoice('/line');
  assert.equal(context.gains[1].gain.value, .5 * .32);
  engine.setVolumes(0, .7);
  assert.equal(context.gains[0].gain.value, 0);
  assert.equal(context.gains[1].gain.value, .7);
  engine.setVolumes(.8, .7);
  assert.equal(context.gains[1].gain.value, .7 * .32);
  context.sources.at(-1).onended();
  assert.equal(state().voice, 'ended');
  assert.equal(context.gains[1].gain.value, .7);
  engine.stopRain();
  assert.equal(state().rain, 'off');
});

test('missing and failed playback report honest states', async t => {
  const { engine, state } = fixture(t, async () => ({ ok: false }));
  await engine.playVoice(null);
  assert.equal(state().voice, 'missing');
  await engine.playVoice('/bad');
  assert.equal(state().voice, 'error');
  await engine.startRain();
  assert.equal(state().rain, 'error');
});

test('blocked playback starts no sources and a later gesture can retry', async t => {
  const { engine, state } = fixture(t);
  engine.unlock();
  const context = Context.instances.at(-1);
  context.state = 'suspended';
  t.mock.method(context, 'resume', async () => {});
  await engine.playVoice('/line');
  assert.equal(state().voice, 'blocked');
  await engine.startRain();
  assert.equal(state().rain, 'blocked');
  assert.equal(context.sources.length, 0);
  context.state = 'running';
  await engine.playVoice('/line');
  assert.equal(state().voice, 'playing');
});

test('pending voice and rain stay stopped after privacy exit or disposal', async t => {
  const releases = [];
  const { engine, state } = fixture(t, () => new Promise(resolve => releases.push(resolve)));
  const voice = engine.playVoice('/line');
  const rain = engine.startRain();
  const context = Context.instances.at(-1);
  engine.stopAll();
  for (const release of releases) release({ ok: true, arrayBuffer: async () => new ArrayBuffer(512) });
  await Promise.all([voice, rain]);
  assert.equal(context.sources.length, 0);
  assert.deepEqual(state(), { voice: 'idle', rain: 'off' });
  engine.dispose();
  assert.equal(context.state, 'closed');
  // React Strict Mode's effect remount can reuse an engine instance safely.
  engine.unlock();
  assert.notEqual(Context.instances.at(-1), context);
});
