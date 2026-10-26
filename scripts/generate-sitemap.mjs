/**
 * Writes public/sitemap.xml and public/robots.txt. Runs automatically before `npm run build`.
 *
 *   SITE_URL=https://www.example.com npm run build
 *
 * Projects are read from the live API when API_URL is set (e.g. https://www.example.com/api), so the
 * sitemap lists exactly what is published; otherwise the bundled src/assets/data/projects.json is used.
 * Without SITE_URL no sitemap is written (it needs absolute URLs) and robots.txt omits the Sitemap line.
 */
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const publicDir = fileURLToPath(new URL('../public/', import.meta.url));
const projectsFile = fileURLToPath(new URL('../src/assets/data/projects.json', import.meta.url));
const siteUrl = (process.env.SITE_URL || '').replace(/\/+$/, '');
const apiUrl = (process.env.API_URL || '').replace(/\/+$/, '');

const robots = ['User-agent: *', 'Disallow: /admin', ''];

async function loadProjectIds() {
  if (apiUrl) {
    try {
      const response = await fetch(`${apiUrl}/projects`);
      if (response.ok) return (await response.json()).data.map((project) => project.id);
      console.warn(`sitemap: ${apiUrl}/projects answered ${response.status}, using projects.json`);
    } catch (error) {
      console.warn(`sitemap: could not reach ${apiUrl} (${error.message}), using projects.json`);
    }
  }
  return JSON.parse(fs.readFileSync(projectsFile, 'utf8')).projects.map((project) => project.id);
}

if (!siteUrl) {
  fs.writeFileSync(`${publicDir}robots.txt`, robots.join('\n'));
  console.warn('sitemap: SITE_URL is not set, so no sitemap.xml was written. Example: SITE_URL=https://www.example.com npm run build');
} else {
  const pages = ['', '/projects', '/services', '/about', '/contact'];
  const projectPages = (await loadProjectIds()).map((id) => `/selected-project/${encodeURIComponent(id)}`);
  const today = new Date().toISOString().slice(0, 10);

  const urls = [...pages, ...projectPages]
    .map((page) => `  <url>\n    <loc>${siteUrl}${page}</loc>\n    <lastmod>${today}</lastmod>\n  </url>`)
    .join('\n');

  fs.writeFileSync(
    `${publicDir}sitemap.xml`,
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
  );
  fs.writeFileSync(`${publicDir}robots.txt`, [...robots, `Sitemap: ${siteUrl}/sitemap.xml`, ''].join('\n'));
  console.log(`sitemap: ${pages.length + projectPages.length} URL(s) written for ${siteUrl}`);
}
