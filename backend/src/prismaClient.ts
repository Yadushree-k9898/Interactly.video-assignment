import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

// Test database connection
async function testConnection() {
  try {
    await prisma.$connect();
    console.log('Successfully connected to the database');
  } catch (error: any) {
    console.error('Database connection error:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
    });
    // Don't exit the process, but let the error propagate
    throw error;
  }
}

// Test connection on startup
testConnection();

export { prisma };