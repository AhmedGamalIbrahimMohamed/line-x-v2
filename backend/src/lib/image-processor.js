import sharp from 'sharp';
import { env } from '../config/env.js';
import { ApiError } from '../utils/errors.js';
import { buildKey, storage } from './storage/index.js';

/**
 * Re-encodes an uploaded image as a capped-width WebP (EXIF orientation applied)
 * and stores it. Returns the site-relative path the project JSON should reference.
 */
export async function processImage(file, folder = 'projects') {
  let buffer;
  try {
    buffer = await sharp(file.buffer, { failOn: 'none' })
      .rotate()
      .resize({ width: env.uploads.fullWidth, withoutEnlargement: true })
      .webp({ quality: env.uploads.quality })
      .toBuffer();
  } catch {
    // The MIME type came from the client; the bytes are not actually a decodable image.
    throw ApiError.badRequest('The file is not a valid image');
  }

  const baseName = (file.originalname || 'image').replace(/\.[^.]+$/, '');
  const stored = await storage.put(buildKey(folder, `${baseName}.webp`), buffer);
  return { url: stored.path, key: stored.key };
}
