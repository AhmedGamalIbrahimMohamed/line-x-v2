/**
 * Shrinks the image assets in place, keeping file names and formats so no code has to change.
 *
 *   node scripts/optimize-images.mjs            # optimize src/assets/images
 *   node scripts/optimize-images.mjs --dry-run  # report what would change
 *
 * - Images wider than MAX_WIDTH are scaled down (a 1920px render is the largest the site shows).
 * - JPEGs are re-encoded as progressive mozjpeg; PNGs are recompressed (large ones are palettised).
 * - A file is only replaced when the result is at least 5% smaller.
 *
 * It uses `sharp` from backend/node_modules, so run `npm install` in backend/ first.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(new URL('../backend/package.json', import.meta.url));
const sharp = require('sharp');

const ROOT = path.resolve(fileURLToPath(new URL('../src/assets/images', import.meta.url)));
const MAX_WIDTH = 1920;
const JPEG_QUALITY = 78;
const PALETTE_THRESHOLD = 500 * 1024;
const dryRun = process.argv.includes('--dry-run');

async function* walk(dir) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (/\.(jpe?g|png)$/i.test(entry.name)) yield full;
  }
}

async function optimize(file) {
  const original = await fs.readFile(file);
  const image = sharp(original, { failOn: 'none' }).rotate().resize({ width: MAX_WIDTH, withoutEnlargement: true });

  const buffer = /\.png$/i.test(file)
    ? await image.png({ compressionLevel: 9, effort: 10, ...(original.length > PALETTE_THRESHOLD ? { palette: true, quality: 82 } : {}) }).toBuffer()
    : await image.jpeg({ quality: JPEG_QUALITY, mozjpeg: true, progressive: true }).toBuffer();

  const smaller = buffer.length < original.length * 0.95;
  if (smaller && !dryRun) await fs.writeFile(file, buffer);
  return { before: original.length, after: smaller ? buffer.length : original.length, changed: smaller };
}

const mb = (bytes) => (bytes / 1048576).toFixed(1);
let before = 0;
let after = 0;
let changed = 0;

for await (const file of walk(ROOT)) {
  try {
    const result = await optimize(file);
    before += result.before;
    after += result.after;
    if (result.changed) {
      changed += 1;
      if (result.before > 512 * 1024) {
        console.log(`${mb(result.before).padStart(6)} MB -> ${mb(result.after).padStart(5)} MB  ${path.relative(ROOT, file).replace(/\\/g, '/')}`);
      }
    }
  } catch (error) {
    console.warn(`skipped ${path.relative(ROOT, file)}: ${error.message}`);
  }
}

console.log(`\n${dryRun ? '[dry run] ' : ''}${changed} file(s) ${dryRun ? 'would shrink' : 'shrunk'}: ${mb(before)} MB -> ${mb(after)} MB`);
