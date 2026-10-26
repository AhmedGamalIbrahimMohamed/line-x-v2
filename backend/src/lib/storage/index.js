import { randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { env } from '../../config/env.js';

const root = path.resolve(process.cwd(), env.storage.directory);

/** Filesystem storage. Files are served from `env.storage.route` by the app. */
export const storage = {
  async init() {
    await fs.mkdir(root, { recursive: true });
  },

  async put(key, buffer) {
    const destination = path.join(root, key);
    await fs.mkdir(path.dirname(destination), { recursive: true });
    await fs.writeFile(destination, buffer);
    return { key, path: this.path(key) };
  },

  async delete(key) {
    if (!key) return;
    // Never let a crafted key escape the uploads directory.
    const destination = path.resolve(root, key);
    if (!destination.startsWith(root + path.sep)) return;
    await fs.rm(destination, { force: true });
  },

  /**
   * Site-relative path (`/uploads/projects/x.webp`). Projects store this form, so
   * moving the API to another domain never breaks saved images; the Angular app
   * prefixes the API origin when it renders them.
   */
  path(key) {
    const encoded = key.split('/').map(encodeURIComponent).join('/');
    return `${env.storage.route}/${encoded}`;
  },
};

/** Collision-proof object key: `projects/<uuid>-name.webp`. */
export function buildKey(folder, filename) {
  const extension = path.extname(filename) || '';
  const base = path
    .basename(filename, extension)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
  return `${folder}/${randomUUID()}${base ? `-${base}` : ''}${extension}`;
}

/**
 * Storage keys referenced by a project document. Matches both the relative form
 * and legacy absolute URLs that still carry the API origin.
 */
export function uploadKeysIn(data) {
  const keys = new Set();
  const pattern = new RegExp(`${env.storage.route}/(projects/[^"\\\\]+)`, 'g');
  for (const match of JSON.stringify(data ?? {}).matchAll(pattern)) {
    keys.add(decodeURIComponent(match[1]));
  }
  return keys;
}

export const initStorage = () => storage.init();
