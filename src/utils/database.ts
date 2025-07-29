import { PrismaClient } from '@prisma/client';

// Create a single instance of Prisma Client
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  errorFormat: 'pretty',
});

// Handle connection errors
prisma.$on('error', (e: any) => {
  console.error('Prisma error:', e);
});

// Graceful shutdown
const gracefulShutdown = async () => {
  await prisma.$disconnect();
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

export default prisma;
