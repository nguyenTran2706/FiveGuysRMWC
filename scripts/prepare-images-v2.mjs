import sharp from 'sharp';
import { join } from 'node:path';
const source = process.argv[2];
if (!source) throw new Error('Provide the generated-images source directory.');
const images = {
  "linh-v2": "exec-8131c60c-4d48-4826-b1c9-ce0cdb60cf09.png",
  "bao-v2": "exec-b36ec195-b758-4612-a9b7-328a28d1487c.png",
  "hanh-v2": "exec-bec9347e-7390-45bf-bef3-db2ae45b0f21.png",
  "tram-v2": "exec-ec492b04-2e54-4298-81b2-0546a72fee51.png",
  "duc-v2": "exec-78bdcfe9-64e4-47c5-a209-2670f79a1589.png",
  "khoa-v2": "exec-d7edb8f6-ff12-4bb3-8bb2-b37501cb07dc.png",
  "mai-v2": "exec-7dc6c707-8f02-4b0e-9a3a-be4794c5ba54.png",
  "title-v2": "exec-761b1e52-06dc-4e87-a067-7ae8a94e2ae6.png"
};
for (const [name, filename] of Object.entries(images)) {
  const result = await sharp(join(source, filename)).resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 82, effort: 6 }).toFile('public/images/' + name + '.webp');
  console.log(name + '.webp: ' + Math.round(result.size / 1024) + ' KB');
}
