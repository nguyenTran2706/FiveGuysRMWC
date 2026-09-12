import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const source = process.argv[2];
if (!source) throw new Error('Provide the generated-images source directory.');
const images = {
  street: 'exec-ea25b46b-a28b-4d00-8aa5-616da4f3239e.png',
  linh: 'exec-007cf50b-10c6-426e-b489-f86c52797bc8.png',
  bao: 'exec-ab0df68c-3eb8-4bac-86e3-6d0c3eeedd0c.png',
  hanh: 'exec-7e58c17b-f8b6-45ef-8de3-eabf2eb5f633.png',
};
await mkdir('public/images', { recursive: true });
for (const [name, filename] of Object.entries(images)) {
  const result = await sharp(join(source, filename)).resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 82, effort: 6 }).toFile(`public/images/${name}.webp`);
  console.log(`${name}.webp: ${Math.round(result.size / 1024)} KB`);
}
