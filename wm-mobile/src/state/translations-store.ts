import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

import { TranslationsApi } from "@src/api/translations";
import { Locale, supportedLocales } from "@src/constants/translations";

const cacheKey = (locale: Locale) => `translations_cache_${locale}`;
const etagKey = (locale: Locale) => `translations_etag_${locale}`;
const modifiedKey = (locale: Locale) => `translations_modified_${locale}`;

type TranslationsState = {
  hydrated: boolean;
  remote: Partial<Record<Locale, Record<string, string>>>;
  etags: Partial<Record<Locale, string>>;
  lastModified: Partial<Record<Locale, string>>;
  refreshing: Partial<Record<Locale, boolean>>;
  hydrate: () => Promise<void>;
  refresh: (locale: Locale) => Promise<void>;
};

export const useTranslationsStore = create<TranslationsState>((set, get) => ({
  hydrated: false,
  remote: {},
  etags: {},
  lastModified: {},
  refreshing: {},
  hydrate: async () => {
    try {
      const entries = await Promise.all(
        supportedLocales.map(async (locale) => {
          const [cached, etag, modified] = await Promise.all([
            AsyncStorage.getItem(cacheKey(locale)),
            AsyncStorage.getItem(etagKey(locale)),
            AsyncStorage.getItem(modifiedKey(locale)),
          ]);
          const parsed = cached ? (JSON.parse(cached) as Record<string, string>) : null;
          return { locale, parsed, etag, modified };
        })
      );
      const remote: Partial<Record<Locale, Record<string, string>>> = {};
      const etags: Partial<Record<Locale, string>> = {};
      const lastModified: Partial<Record<Locale, string>> = {};
      entries.forEach((entry) => {
        if (entry.parsed) remote[entry.locale] = entry.parsed;
        if (entry.etag) etags[entry.locale] = entry.etag;
        if (entry.modified) lastModified[entry.locale] = entry.modified;
      });
      set({ remote, etags, lastModified, hydrated: true });
    } catch {
      set({ hydrated: true });
    }
  },
  refresh: async (locale) => {
    const { refreshing, etags, lastModified } = get();
    if (refreshing[locale]) return;
    set({ refreshing: { ...refreshing, [locale]: true } });
    try {
      const headers: Record<string, string> = {};
      if (etags[locale]) headers["If-None-Match"] = etags[locale] as string;
      if (lastModified[locale]) headers["If-Modified-Since"] = lastModified[locale] as string;

      const response = await TranslationsApi.getTranslations(locale, headers);
      if (response.status === 304) {
        return;
      }
      if (!response.data?.success || !response.data.data?.translations) {
        return;
      }

      const nextTranslations = response.data.data.translations;
      const etag = response.headers?.etag as string | undefined;
      const modifiedHeader = response.headers?.["last-modified"] as string | undefined;
      const modified = modifiedHeader
        ? modifiedHeader
        : response.data.data.updatedAt
        ? new Date(response.data.data.updatedAt).toUTCString()
        : undefined;

      await AsyncStorage.setItem(cacheKey(locale), JSON.stringify(nextTranslations));
      if (etag) await AsyncStorage.setItem(etagKey(locale), etag);
      if (modified) await AsyncStorage.setItem(modifiedKey(locale), modified);

      set((state) => ({
        remote: { ...state.remote, [locale]: nextTranslations },
        etags: { ...state.etags, ...(etag ? { [locale]: etag } : {}) },
        lastModified: { ...state.lastModified, ...(modified ? { [locale]: modified } : {}) },
      }));
    } catch {
      // Ignore translation refresh errors; fallback remains local.
    } finally {
      set((state) => ({ refreshing: { ...state.refreshing, [locale]: false } }));
    }
  },
}));
