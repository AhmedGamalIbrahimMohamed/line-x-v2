import { PrismaClient } from '@prisma/client';
import { env } from '../config/env.js';

/**
 * A single Prisma client for the process. `globalThis` caching keeps
 * `node --watch` from opening a new pool on every reload in development.
 */
const globalForPrisma = globalThis;

export const prisma = globalForPrisma.__xlinePrisma ?? new PrismaClient({ log: ['warn', 'error'] });

if (!env.isProduction) globalForPrisma.__xlinePrisma = prisma;

export async function disconnectPrisma() {
  await prisma.$disconnect();
}
