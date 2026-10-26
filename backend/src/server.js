import { createApp } from './app.js';
import { assertConfig, env } from './config/env.js';
import { disconnectPrisma, prisma } from './lib/prisma.js';
import { initStorage } from './lib/storage/index.js';

async function main() {
  assertConfig();

  await prisma.$connect();
  await initStorage();

  const app = createApp();
  const server = app.listen(env.port, () => {
    console.log('');
    console.log('  X-LINE — API');
    console.log(`  ${'─'.repeat(40)}`);
    console.log(`  Environment  ${env.nodeEnv}`);
    console.log(`  API root     http://localhost:${env.port}${env.apiPrefix}`);
    console.log(`  CORS         ${env.cors.origins.join(', ')}`);
    console.log('');
  });

  // Let in-flight requests finish before the process exits.
  const shutdown = (signal) => {
    console.log(`\n[${signal}] shutting down…`);
    server.close(async () => {
      await disconnectPrisma();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

main().catch((error) => {
  console.error('\nFailed to start the API:\n');
  console.error(error.message);
  process.exit(1);
});
