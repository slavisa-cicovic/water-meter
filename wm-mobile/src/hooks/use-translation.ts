import { useCallback } from "react";

import { defaultLocale, localeOptions, translations } from "@src/constants/translations";
import { useLocaleStore } from "@src/state/locale-store";

export const useTranslation = () => {
  const locale = useLocaleStore((state) => state.locale);
  const setLocale = useLocaleStore((state) => state.setLocale);

  const t = useCallback(
    (key: string) => translations[locale]?.[key] ?? translations[defaultLocale]?.[key] ?? key,
    [locale]
  );

  return {
    t,
    locale,
    locales: localeOptions,
    setLocale,
  };
};
