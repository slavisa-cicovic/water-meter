import fs from "fs/promises";
import path from "path";
import { TranslationsRepository } from "src/repositories/translationsRepository";
import { TranslationBundle, TranslationUpdate } from "src/types/translations";

const SUPPORTED_LOCALES = ["en", "sr-Latn", "sr-Cyrl"] as const;
type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

const normalizeLocale = (value: string): SupportedLocale | null => {
  const normalized = value === "sr" ? "sr-Latn" : value;
  return SUPPORTED_LOCALES.includes(normalized as SupportedLocale)
    ? (normalized as SupportedLocale)
    : null;
};

const seedPathForLocale = (locale: SupportedLocale) =>
  path.join(process.cwd(), "src", "translations", "mobile", `${locale}.json`);

const loadSeed = async (locale: SupportedLocale): Promise<Record<string, string>> => {
  const filePath = seedPathForLocale(locale);
  const content = await fs.readFile(filePath, "utf-8");
  return JSON.parse(content) as Record<string, string>;
};

const ensureSeeded = async (locale: SupportedLocale) => {
  const count = await TranslationsRepository.countByLocale(locale);
  if (count > 0) return;
  const seed = await loadSeed(locale);
  const entries = Object.entries(seed).map(([key, value]) => ({ key, value }));
  await TranslationsRepository.createMany(locale, entries);
};

const toBundle = (locale: SupportedLocale, rows: Array<{ key: string; value: string; updatedAt: Date }>) => {
  const translations: Record<string, string> = {};
  let updatedAt: Date | null = null;
  rows.forEach((row) => {
    translations[row.key] = row.value;
    if (!updatedAt || row.updatedAt > updatedAt) {
      updatedAt = row.updatedAt;
    }
  });

  return {
    locale,
    updatedAt: updatedAt ? updatedAt.toISOString() : null,
    translations,
  } satisfies TranslationBundle;
};

export const TranslationsService = {
  async getBundle(locale: string): Promise<TranslationBundle | null> {
    const resolved = normalizeLocale(locale);
    if (!resolved) return null;

    await ensureSeeded(resolved);
    const rows = await TranslationsRepository.listByLocale(resolved);
    return toBundle(resolved, rows);
  },

  async update(locale: string, updates: TranslationUpdate[], actorId?: string): Promise<TranslationBundle | null> {
    const resolved = normalizeLocale(locale);
    if (!resolved) return null;

    await ensureSeeded(resolved);

    const keys = updates.map((entry) => entry.key);
    const existingKeys = await TranslationsRepository.listKeysByLocale(resolved);
    const existingSet = new Set(existingKeys);
    const unknownKeys = keys.filter((key) => !existingSet.has(key));
    if (unknownKeys.length) {
      return null;
    }

    await TranslationsRepository.updateValues(
      resolved,
      updates.map((entry) => ({
        key: entry.key,
        value: entry.value,
        updatedById: actorId,
      }))
    );

    const rows = await TranslationsRepository.listByLocale(resolved);
    return toBundle(resolved, rows);
  },
};
