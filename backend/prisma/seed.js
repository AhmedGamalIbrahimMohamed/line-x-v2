/**
 * Seeds the first admin account and imports the projects from the Angular
 * site's static `src/assets/data/projects.json`.
 *
 * Re-running is safe: an existing admin keeps their password (use
 * `npm run admin:set` to change it) and existing projects are left untouched,
 * so content edited from the dashboard is never overwritten.
 */
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient();
const projectsFile = fileURLToPath(new URL('../../src/assets/data/projects.json', import.meta.url));

async function seedAdmin() {
  const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || '';
  if (!email || !password) {
    console.log('  Skipped admin — set ADMIN_EMAIL and ADMIN_PASSWORD in .env');
    return;
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`  Admin exists — ${email}`);
    return;
  }

  await prisma.user.create({
    data: {
      email,
      name: process.env.ADMIN_NAME || 'X-Line Administrator',
      role: 'ADMIN',
      password: await bcrypt.hash(password, 12),
    },
  });
  console.log(`  Admin created — ${email}`);
}

async function seedProjects() {
  if (!fs.existsSync(projectsFile)) {
    console.log('  Skipped projects — projects.json not found');
    return;
  }

  const { projects } = JSON.parse(fs.readFileSync(projectsFile, 'utf8'));
  let created = 0;

  for (const [index, project] of projects.entries()) {
    const { id, category, ...data } = project;
    const exists = await prisma.project.findUnique({ where: { id }, select: { id: true } });
    if (exists) continue;
    await prisma.project.create({ data: { id, category, sortOrder: index, data } });
    created += 1;
  }
  console.log(`  Projects imported — ${created} new, ${projects.length - created} already present`);
}

async function main() {
  console.log('\nSeeding…');
  await seedAdmin();
  await seedProjects();
  console.log('Done.\n');
}

main()
  .catch((error) => {
    console.error('\nSeed failed:\n', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
