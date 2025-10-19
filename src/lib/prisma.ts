import { PrismaClient } from '@prisma/client';

// Keep a single PrismaClient instance across hot reloads in dev.
// (globalThis typing avoids TS "global" clashes in Next).
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // Enable verbose logs in dev if you want:
    // log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
