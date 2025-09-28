import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  errorFormat: 'minimal',
});

// Optional: Reduce connection pool for Neon free tier
// process.env.DATABASE_URL can include `?pgbouncer=true&connection_limit=1`
// Or configure in Prisma schema with `pool_timeout`
// This helps prevent "terminating connection" errors

// Test database connection on startup
(async function testConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Successfully connected to the database');
  } catch (error: any) {
    console.error('❌ Database connection error:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
    });
    // Optionally: process.exit(1);
  }
})();

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('📦 Closing database connection...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('📦 Closing database connection...');
  await prisma.$disconnect();
  process.exit(0);
});

export { prisma };
