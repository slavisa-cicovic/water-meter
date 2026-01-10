import fs from "fs/promises";
import path from "path";
import { TranslationsRepository } from "src/repositories/translationsRepository";
import { TranslationBundle, TranslationTarget, TranslationUpdate } from "src/types/translations";

const SUPPORTED_LOCALES = ["en", "sr-Latn", "sr-Cyrl"] as const;
type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
const SUPPORTED_TARGETS: TranslationTarget[] = ["mobile", "web"];

const normalizeLocale = (value: string): SupportedLocale | null => {
  const normalized = value === "sr" ? "sr-Latn" : value;
  return SUPPORTED_LOCALES.includes(normalized as SupportedLocale)
    ? (normalized as SupportedLocale)
    : null;
};

const normalizeTarget = (value?: string | null): TranslationTarget | null => {
  if (!value) return "mobile";
  return SUPPORTED_TARGETS.includes(value as TranslationTarget) ? (value as TranslationTarget) : null;
};

const seedPathForLocale = (target: TranslationTarget, locale: SupportedLocale) => {
  if (target === "web") {
    return path.join(process.cwd(), "src", "locales", "langs", `${locale}.json`);
  }
  return path.join(process.cwd(), "src", "translations", "mobile", `${locale}.json`);
};

const loadSeed = async (target: TranslationTarget, locale: SupportedLocale): Promise<Record<string, string>> => {
  const filePath = seedPathForLocale(target, locale);
  const content = await fs.readFile(filePath, "utf-8");
  const parsed = JSON.parse(content) as Record<string, unknown>;
  return target === "web" ? flattenTranslations(parsed) : (parsed as Record<string, string>);
};

const flattenTranslations = (
  data: Record<string, unknown>,
  prefix = "",
  result: Record<string, string> = {}
): Record<string, string> => {
  Object.entries(data).forEach(([key, value]) => {
    const nextKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      flattenTranslations(value as Record<string, unknown>, nextKey, result);
      return;
    }
    result[nextKey] = String(value ?? "");
  });
  return result;
};

const ensureSeeded = async (target: TranslationTarget, locale: SupportedLocale) => {
  const seed = await loadSeed(target, locale);
  const entries = Object.entries(seed).map(([key, value]) => ({ key, value }));
  const existingKeys = await TranslationsRepository.listKeysByTargetLocale(target, locale);
  if (!existingKeys.length) {
    await TranslationsRepository.createMany(target, locale, entries);
    return;
  }
  const existingSet = new Set(existingKeys);
  const missingEntries = entries.filter((entry) => !existingSet.has(entry.key));
  await TranslationsRepository.createMany(target, locale, missingEntries);
};

const toBundle = (
  target: TranslationTarget,
  locale: SupportedLocale,
  rows: Array<{ key: string; value: string; updatedAt: Date }>
) => {
  const translations: Record<string, string> = {};
  let updatedAtIso: string | null = null;
  rows.forEach((row) => {
    translations[row.key] = row.value;
    if (!updatedAtIso || row.updatedAt > new Date(updatedAtIso)) {
      updatedAtIso = row.updatedAt.toISOString();
    }
  });

  return {
    target,
    locale,
    updatedAt: updatedAtIso,
    translations,
  } satisfies TranslationBundle;
};

export const TranslationsService = {
  async getBundle(locale: string, target?: string | null): Promise<TranslationBundle | null> {
    const resolved = normalizeLocale(locale);
    const resolvedTarget = normalizeTarget(target);
    if (!resolved || !resolvedTarget) return null;

    await ensureSeeded(resolvedTarget, resolved);
    const rows = await TranslationsRepository.listByTargetLocale(resolvedTarget, resolved);
    return toBundle(resolvedTarget, resolved, rows);
  },

  async update(
    locale: string,
    target: string | null | undefined,
    updates: TranslationUpdate[],
    actorId?: string
  ): Promise<TranslationBundle | null> {
    const resolved = normalizeLocale(locale);
    const resolvedTarget = normalizeTarget(target);
    if (!resolved || !resolvedTarget) return null;

    await ensureSeeded(resolvedTarget, resolved);

    const keys = updates.map((entry) => entry.key);
    const existingKeys = await TranslationsRepository.listKeysByTargetLocale(resolvedTarget, resolved);
    const existingSet = new Set(existingKeys);
    const unknownKeys = keys.filter((key) => !existingSet.has(key));
    if (unknownKeys.length) {
      return null;
    }

    await TranslationsRepository.updateValues(
      resolvedTarget,
      resolved,
      updates.map((entry) => ({
        key: entry.key,
        value: entry.value,
        updatedById: actorId,
      }))
    );

    const rows = await TranslationsRepository.listByTargetLocale(resolvedTarget, resolved);
    return toBundle(resolvedTarget, resolved, rows);
  },
};
