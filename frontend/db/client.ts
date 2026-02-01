import { PrismaClient } from '@prisma/client';
import { dbConfig, isDevelopment } from './config';

const globalForPrisma = global as unknown as { prisma?: PrismaClient };

function createPrismaClient() {
  try {
    return new PrismaClient({
      log: isDevelopment ? ['query', 'warn', 'error'] : ['warn', 'error'],
      datasources: { db: { url: dbConfig.url } },
    });
  } catch (error) {
    console.warn('Prisma client creation failed:', error);
    // Return a mock client during build time
    return null;
  }
}

export const prisma =
  globalForPrisma.prisma ?? createPrismaClient();

if (isDevelopment && prisma) globalForPrisma.prisma = prisma;

// Graceful shutdown
if (prisma) {
  process.on('beforeExit', async () => await prisma.$disconnect());
}

export default prisma;
