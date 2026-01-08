import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

import { defaultLocale, Locale, normalizeLocale } from "@src/constants/translations";

const LOCALE_KEY = "app_locale";

type LocaleState = {
  hydrated: boolean;
  locale: Locale;
  hydrate: () => Promise<void>;
  setLocale: (nextLocale: Locale) => Promise<void>;
};

export const useLocaleStore = create<LocaleState>((set) => ({
  hydrated: false,
  locale: defaultLocale,
  hydrate: async () => {
    try {
      const stored = await AsyncStorage.getItem(LOCALE_KEY);
      set({ locale: normalizeLocale(stored), hydrated: true });
    } catch {
      set({ hydrated: true });
    }
  },
  setLocale: async (nextLocale) => {
    set({ locale: nextLocale });
    try {
      await AsyncStorage.setItem(LOCALE_KEY, nextLocale);
    } catch {
      // Storage failures should not block language changes.
    }
  },
}));
