import sharp from 'sharp';
import { mkdir, readFile, stat } from 'node:fs/promises';
import { dirname, join, resolve, sep } from 'node:path';

const source = process.argv[2];
if (!source) throw new Error('Provide the generated-images source directory.');
const manifest = JSON.parse(await readFile(new URL('./conversation-art-sources.json', import.meta.url), 'utf8'));
const root = resolve('public/images/conversations');
let count = 0;
for (const scene of manifest) {
  const target = resolve(scene.target);
  if (!target.startsWith(root + sep)) throw new Error('Unexpected artwork destination');
  if (await stat(target).catch(() => null)) continue;
  await mkdir(dirname(target), { recursive: true });
  await sharp(join(source, scene.filename)).resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 80, effort: 6 }).toFile(target);
  count++;
}
console.log('Prepared ' + count + ' new conversation images.');
