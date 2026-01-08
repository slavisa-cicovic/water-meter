import prisma from "src/utils/prisma";

export type TranslationRecord = {
  key: string;
  value: string;
  updatedAt: Date;
};

export const TranslationsRepository = {
  async countByTargetLocale(target: string, locale: string) {
    return prisma.translation.count({ where: { target, locale } });
  },

  async listByTargetLocale(target: string, locale: string): Promise<TranslationRecord[]> {
    return prisma.translation.findMany({
      where: { target, locale },
      select: { key: true, value: true, updatedAt: true },
      orderBy: { key: "asc" },
    });
  },

  async listKeysByTargetLocale(target: string, locale: string): Promise<string[]> {
    const rows = await prisma.translation.findMany({
      where: { target, locale },
      select: { key: true },
    });
    return rows.map((row) => row.key);
  },

  async createMany(target: string, locale: string, data: Array<{ key: string; value: string }>) {
    if (!data.length) return;
    await prisma.translation.createMany({
      data: data.map((entry) => ({ target, locale, key: entry.key, value: entry.value })),
      skipDuplicates: true,
    });
  },

  async updateValues(
    target: string,
    locale: string,
    updates: Array<{ key: string; value: string; updatedById?: string }>
  ) {
    if (!updates.length) return;
    await prisma.$transaction(
      updates.map((entry) =>
        prisma.translation.update({
          where: { target_locale_key: { target, locale, key: entry.key } },
          data: { value: entry.value, updatedById: entry.updatedById },
        })
      )
    );
  },
};
