import multer from 'multer';
import { env } from '../config/env.js';
import { ApiError } from '../utils/errors.js';

/** Images are buffered in memory and go straight through sharp to storage. */
export const uploadSingleImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.uploads.maxFileSizeMb * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) =>
    env.uploads.imageMimeTypes.includes(file.mimetype)
      ? cb(null, true)
      : cb(ApiError.unsupportedMedia(`"${file.mimetype}" is not an accepted file type`)),
}).single('image');
