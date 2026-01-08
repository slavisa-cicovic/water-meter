import prisma from "src/utils/prisma";

export type TranslationRecord = {
  key: string;
  value: string;
  updatedAt: Date;
};

export const TranslationsRepository = {
  async countByLocale(locale: string) {
    return prisma.translation.count({ where: { locale } });
  },

  async listByLocale(locale: string): Promise<TranslationRecord[]> {
    return prisma.translation.findMany({
      where: { locale },
      select: { key: true, value: true, updatedAt: true },
      orderBy: { key: "asc" },
    });
  },

  async listKeysByLocale(locale: string): Promise<string[]> {
    const rows = await prisma.translation.findMany({
      where: { locale },
      select: { key: true },
    });
    return rows.map((row) => row.key);
  },

  async createMany(locale: string, data: Array<{ key: string; value: string }>) {
    if (!data.length) return;
    await prisma.translation.createMany({
      data: data.map((entry) => ({ locale, key: entry.key, value: entry.value })),
      skipDuplicates: true,
    });
  },

  async updateValues(locale: string, updates: Array<{ key: string; value: string; updatedById?: string }>) {
    if (!updates.length) return;
    await prisma.$transaction(
      updates.map((entry) =>
        prisma.translation.update({
          where: { locale_key: { locale, key: entry.key } },
          data: { value: entry.value, updatedById: entry.updatedById },
        })
      )
    );
  },
};
