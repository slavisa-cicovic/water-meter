import { PrismaClient } from '@prisma/client';
import { NODE_ENV } from 'src/config-global';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
