import { PrismaClient } from '@prisma/client';

export const prisma =
  globalThis.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

export default prisma;

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}
