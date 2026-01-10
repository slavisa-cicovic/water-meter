import prisma from 'src/utils/prisma';

export const AiFaqRepository = {
  async listActive(limit = 50) {
    return prisma.aiFaqEntry.findMany({
      where: { isActive: true },
      orderBy: { updatedAt: 'desc' },
      take: limit,
      select: {
        id: true,
        question: true,
        answer: true,
        updatedAt: true,
      },
    });
  },
};
