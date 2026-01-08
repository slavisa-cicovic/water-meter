import { useCallback, useMemo } from "react";

import { defaultLocale, localeOptions, translations } from "@src/constants/translations";
import { useLocaleStore } from "@src/state/locale-store";
import { useTranslationsStore } from "@src/state/translations-store";

export const useTranslation = () => {
  const locale = useLocaleStore((state) => state.locale);
  const setLocale = useLocaleStore((state) => state.setLocale);
  const remoteTranslations = useTranslationsStore((state) => state.remote[locale]);

  const mergedTranslations = useMemo(() => {
    const local = translations[locale] ?? {};
    return remoteTranslations ? { ...local, ...remoteTranslations } : local;
  }, [locale, remoteTranslations]);

  const t = useCallback(
    (key: string) => mergedTranslations[key] ?? translations[defaultLocale]?.[key] ?? key,
    [mergedTranslations]
  );

  return {
    t,
    locale,
    locales: localeOptions,
    setLocale,
  };
};
