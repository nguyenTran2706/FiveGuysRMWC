import { build } from 'esbuild';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const check = process.argv.includes('--check');
const complete = process.argv.includes('--require-complete');
const hash = text => createHash('sha256').update(text).digest('hex');
async function source(relative) {
  const result = await build({ entryPoints: [join(root, relative)], bundle: true, write: false, format: 'esm', platform: 'node' });
  return import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`);
}
const { residents } = await source('src/data/stories.ts');
const { characterVoices, voicePackLabels } = await source('src/data/characterVoices.ts');
const files = new Map();
const cues = [];
const recordings = {};
const problems = [];
const sentence = text => text.replaceAll('\n', ' ');
async function optional(path) {
  try { return await readFile(path); } catch (error) { if (error.code === 'ENOENT') return null; throw error; }
}

for (const resident of residents) {
  const cast = characterVoices[resident.id];
  if (!cast) throw new Error(`Missing casting for ${resident.id}`);
  for (const language of ['vi', 'en']) {
    const pack = cast[language];
    const items = [
      ...Object.values(resident.nodes).map(node => ({ ...node, category: node.kind ?? 'dialogue' })),
      ...['kept', 'missed'].map(ending => ({ id: `ending-${ending}`, text: resident.epilogue[ending], category: 'epilogue' })),
    ];
    const sections = [];
    for (const item of items) {
      const text = item.text[language];
      const textSha256 = hash(text);
      const key = `${pack}/${resident.id}/${item.id}`;
      const src = `/audio/dialogue/${key}.mp3`;
      const reviewFile = `recording-reviews/${key}.json`;
      const incoming = Object.values(resident.nodes).flatMap(node => [
        ...(node.next === item.id ? [{ from: node.id, type: 'continue' }] : []),
        ...(node.choices ?? []).filter(choice => choice.next === item.id).map(choice => ({ from: node.id, type: 'choice', text: choice.text[language], trust: choice.trust ?? 0, recordEvidence: !!choice.recordEvidence })),
      ]);
      const directions = [
        item.category === 'artifact' ? 'Read the visible description and quoted document clearly; no legal-adviser delivery.' : item.category === 'epilogue' ? 'Reflective narration. Read the fictional-ending label and final caveat. Never promise a real outcome.' : 'Speak to one nearby listener. Read the entire caption, including narration; subtly shift into quoted speech without introducing another actor.',
        incoming.some(entry => entry.trust < 0) ? 'After a pushy response: a smaller, more guarded delivery, never a punishment or angry accusation.' : incoming.some(entry => entry.recordEvidence) ? 'A little more agency and ease; cautious relief, not a triumphant resolution.' : incoming.some(entry => entry.trust > 0) ? 'A little more space and trust; keep the vulnerability conversational.' : 'Continue from the preceding scene; keep voice identity and microphone distance consistent.',
      ];
      const bytes = await optional(join(root, 'public', src));
      const reviewBytes = await optional(join(root, reviewFile));
      let status = 'pending-recording';
      let audioSha256;
      if (bytes || reviewBytes) {
        status = 'needs-review';
        try {
          if (!bytes || !reviewBytes) throw new Error('Both MP3 and recording review JSON are required');
          const review = JSON.parse(reviewBytes.toString('utf8'));
          audioSha256 = hash(bytes);
          if (review.textSha256 !== textSha256) throw new Error('Caption hash does not match the current script');
          if (review.audioSha256 !== audioSha256) throw new Error('Audio changed since the listening review');
          if (review.humanPerformed !== true || review.approved !== true || review.accent !== pack) throw new Error('A human performance and accent/listening approval are required');
          if (bytes.length < 512 || bytes.length > 12_000_000) throw new Error('MP3 outside 512-byte to 12 MB budget');
          if (!(bytes.subarray(0, 3).toString() === 'ID3' || (bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0))) throw new Error('Not an MP3 header');
          status = 'ready';
          recordings[key] = { src: `${src}?v=${audioSha256.slice(0, 12)}`, text, sha256: audioSha256 };
        } catch (error) { problems.push(`${key}: ${error.message}`); }
      }
      const cue = { character: resident.id, language, pack, cue: item.id, category: item.category, text, textSha256, src, reviewFile, incoming, next: item.next ?? null, choices: (item.choices ?? []).map(choice => ({ id: choice.id, text: choice.text[language], next: choice.next })), directions, status, ...(audioSha256 ? { audioSha256 } : {}) };
      cues.push(cue);
      const context = incoming.length ? incoming.map(entry => entry.type === 'choice' ? `${entry.from}: listener chooses “${sentence(entry.text)}”` : `${entry.from}: Continue`).join('; ') : item.id === resident.start ? 'First meeting after entering this story.' : 'After the debrief; use this ending only when selected by the story.';
      sections.push(`## ${item.id}\n\n- File: \`public${src}\`\n- Type: ${item.category}; status: ${status}\n- Lead-in (do not read): ${context}\n- Direction (do not read): ${directions.join(' ')}\n- Caption SHA-256: \`${textSha256}\`\n\n### Read / Đọc\n\n${text}\n\n### Exit cue (do not read)\n\n${cue.choices.length ? cue.choices.map(choice => `- Listener: “${sentence(choice.text)}” → \`${choice.next}\``).join('\n') : item.next ? `Continue → \`${item.next}\`` : 'Return to the street or continue to support.'}\n\nTakes: A [ ] B [ ] Selected: ______  Pronunciation checked [ ]  Full caption checked [ ]\n`);
    }
    files.set(`docs/recording-scripts/${resident.id}-${language}.md`, `# ${resident.name} — ${voicePackLabels[pack]}\n\nGenerated from the live story; edit the source text, then run \`npm run audio:prepare\`. Do not edit this packet by hand.\n\n${items.length} complete cues. One consistent human performer for this character/language.\n\n## Performance brief / Hướng dẫn thu âm\n\n${cast.direction}\n\nAccent: ${voicePackLabels[pack]}. Use a fluent speaker who naturally uses this accent. Do not turn an accent into an impression or change spelling to imitate it. Vietnamese and English scripts intentionally follow their own existing captions; do not translate missing sentences yourself.\n\nĐọc nguyên văn phần “Read / Đọc”, kể cả lời dẫn và câu trong ngoặc kép. Không đọc tên tệp, mã cảnh, lựa chọn của người nghe hay hướng dẫn diễn xuất. Nói tự nhiên với một người đang đứng gần; không gồng giọng, không bắt chước giọng máy.\n\nRead narration in a gentle storyteller register and quotations as the character, in the same file and voice. Read “A pause” / “Một nhịp lặng” because it is part of the current caption, then allow a short breath. Do not replace caption text with silence. See [production guide](../audio-production.md) for recording, pronunciation, filenames, review and import.\n\n${sections.join('\n')}`);
  }
}
const ready = cues.filter(cue => cue.status === 'ready').length;
files.set('docs/recording-scripts/manifest.json', JSON.stringify({ version: 1, total: cues.length, ready, cues }, null, 2) + '\n');
files.set('src/data/dialogueAudio.generated.json', JSON.stringify({ recordings }, null, 2) + '\n');
files.set('docs/recording-scripts/README.md', `# Complete human-recording package\n\n${residents.length} residents · ${cues.length / 2} story cues · ${cues.length} recordings across Vietnamese and English.\n\nReady: **${ready}/${cues.length}**. Pending clips are intentionally silent in the app, with a readable notice; no text-to-speech fallback.\n\nThese are fixed assignments, not three full alternate casts and not random choices. Accent families are shared, but every character keeps an individual performer and delivery. Assignments are casting proposals, not new character biography.\n\n| Character | Vietnamese packet | English packet | Cues per language |\n|---|---|---|---|\n${residents.map(resident => `| ${resident.name} | [${voicePackLabels[characterVoices[resident.id].vi]}](${resident.id}-vi.md) | [${voicePackLabels[characterVoices[resident.id].en]}](${resident.id}-en.md) | ${Object.keys(resident.nodes).length + 2} |`).join('\n')}\n\n[Production guide](../audio-production.md) · [Complete cue manifest](manifest.json)\n\nIncludes every dialogue node, artifact narration, closed branch and both endings. Excludes menu labels, listener choices, rights chatbot responses, personal reflections and intake answers. Those are not character speech and must not read private visitor text aloud.\n\nRefresh after any caption/casting edit: \`npm run audio:prepare\`. Verify without writing: \`npm run audio:check\`. Require every human recording before a voiced release: \`npm run audio:check -- --require-complete\`.\n`);

for (const [relative, content] of files) {
  const path = join(root, relative);
  if (check) {
    if ((await optional(path))?.toString('utf8') !== content) problems.push(`${relative}: missing or stale; run npm run audio:prepare`);
  } else { await mkdir(dirname(path), { recursive: true }); await writeFile(path, content, 'utf8'); }
}
if (complete && ready !== cues.length) problems.push(`Human recordings incomplete: ${ready}/${cues.length} ready`);
console.log(`${check ? 'Checked' : 'Prepared'} ${cues.length} cues in ${residents.length * 2} performer packets; ${ready} approved recordings.`);
if (problems.length) { console.error(problems.join('\n')); process.exitCode = 1; }
