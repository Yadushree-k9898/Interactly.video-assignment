import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testConnection() {
  const prisma = new PrismaClient();
  try {
    console.log('Testing database connection...');
    console.log('Database URL:', process.env.DATABASE_URL);
    
    // Try to connect
    await prisma.$connect();
    console.log('Successfully connected to the database');
    
    // Try a simple query
    const count = await prisma.videoRequest.count();
    console.log('Number of video requests:', count);
    
  } catch (error) {
    console.error('Error connecting to the database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();