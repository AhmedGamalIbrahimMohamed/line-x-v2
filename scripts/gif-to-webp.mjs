/**
 * Converts an animated GIF to an animated WebP, which is usually 5-10x smaller.
 *
 *   node scripts/gif-to-webp.mjs <input.gif> <output.webp> [width=960] [quality=48]
 *
 * Raise width/quality for a sharper (and larger) result, e.g. `... 1280 62` is about 20 MB for the
 * 10-second partner animation, `... 960 48` about 9 MB. Uses `sharp` from backend/node_modules.
 */
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(new URL('../backend/package.json', import.meta.url));
const sharp = require('sharp');

const [input, output, width = '960', quality = '48'] = process.argv.slice(2);
if (!input || !output) {
  console.error('Usage: node scripts/gif-to-webp.mjs <input.gif> <output.webp> [width=960] [quality=48]');
  process.exit(1);
}

await sharp(input, { animated: true, limitInputPixels: false })
  .resize({ width: Number(width), withoutEnlargement: true })
  .webp({ quality: Number(quality), effort: 4, loop: 0 })
  .toFile(output);

const mb = (file) => (fs.statSync(file).size / 1048576).toFixed(1);
console.log(`${input} (${mb(input)} MB) -> ${output} (${mb(output)} MB)`);
