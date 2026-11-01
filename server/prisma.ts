import { PrismaClient } from '@prisma/client';
import { seedPrismaDatabase } from '../prisma/seed.ts';

export const prisma = new PrismaClient();

// Auto-seed on server startup
seedPrismaDatabase().catch(err => {
  console.error('Failed to run Prisma initial seed:', err);
});
