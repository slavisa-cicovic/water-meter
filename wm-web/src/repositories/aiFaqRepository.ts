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

  async listAll() {
    return prisma.aiFaqEntry.findMany({
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        question: true,
        answer: true,
        isActive: true,
        updatedAt: true,
      },
    });
  },

  async create(input: { question: string; answer: string; isActive?: boolean }) {
    return prisma.aiFaqEntry.create({
      data: {
        question: input.question,
        answer: input.answer,
        isActive: input.isActive ?? true,
      },
    });
  },

  async update(input: { id: string; question: string; answer: string; isActive: boolean }) {
    return prisma.aiFaqEntry.update({
      where: { id: input.id },
      data: {
        question: input.question,
        answer: input.answer,
        isActive: input.isActive,
      },
    });
  },
};
