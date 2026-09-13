import { readFile, readdir, writeFile } from 'node:fs/promises';
const plan = JSON.parse(await readFile('scripts/conversation-art-plan.json', 'utf8'));
const previous = JSON.parse(await readFile('scripts/conversation-art-sources.json', 'utf8'));
const completed = new Map(previous.map(item => [item.id, item]));
const directory = '.tools/conversation-completed';
for (const name of await readdir(directory).catch(() => [])) {
  if (!name.endsWith('.json')) continue;
  const entry = JSON.parse(await readFile(directory + '/' + name, 'utf8'));
  const planned = plan.find(item => item.id === entry.id);
  if (!planned || planned.target !== entry.target || !/^exec-[0-9a-f-]+\.png$/.test(entry.filename)) throw new Error('Unexpected scene record: ' + name);
  completed.set(entry.id, entry);
}
const ordered = plan.map(item => completed.get(item.id)).filter(Boolean);
await writeFile('scripts/conversation-art-sources.json', JSON.stringify(ordered, null, 2) + '\n');
console.log(ordered.length + '/' + plan.length + ' generated scenes recorded.');
