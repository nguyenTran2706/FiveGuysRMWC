// Curator tool, not shipped in the app bundle.
// Re-checks every Fair Work source behind src/data/fairworkRights.mjs and reports whether
// the page still exists and when Fair Work last updated it. Pass --write to stamp today's
// date as the `checked` value once you have reviewed each page's wording.
//   node scripts/refresh-rights-kb.mjs [--write]
import { readFile, writeFile } from 'node:fs/promises';
import { knowledgeBase } from '../src/data/fairworkRights.mjs';

const file = new URL('../src/data/fairworkRights.mjs', import.meta.url);
const urls = [...new Set(knowledgeBase.entries.map(entry => entry.source.url))];
let failures = 0;

for (const url of urls) {
  try {
    const response = await fetch(url, { headers: { 'user-agent': 'know-your-rights-kb-check' } });
    const html = response.ok ? await response.text() : '';
    const updated = html.match(/Content last updated:\s*<?[^>]*>?\s*(\d{4}-\d{2}-\d{2})/i)?.[1] ?? 'unknown';
    if (!response.ok) failures += 1;
    console.log(`${response.ok ? 'ok  ' : 'FAIL'} ${response.status}  last updated ${updated}  ${url}`);
  } catch (error) {
    failures += 1;
    console.log(`FAIL  -    ${url}  (${error.message})`);
  }
}

const today = new Date().toISOString().slice(0, 10);
if (process.argv.includes('--write') && !failures) {
  const source = await readFile(file, 'utf8');
  await writeFile(file, source.replace(/"checked": "\d{4}-\d{2}-\d{2}"/, `"checked": "${today}"`));
  console.log(`\nstamped checked: ${today}`);
} else {
  console.log(`\n${failures} source(s) unreachable. Review page wording before stamping checked (${knowledgeBase.checked}).`);
}
process.exit(failures ? 1 : 0);
