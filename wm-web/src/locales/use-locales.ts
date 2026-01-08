'use client';

import { useTranslation } from 'react-i18next';
import { useCallback } from 'react';
import 'src/locales/i18n';
// utils
import { localStorageGetItem } from 'src/utils/storage-available';
// components
import { useSettingsContext } from 'src/components/settings';
//
import { allLangs, defaultLang } from './config-lang';

// ----------------------------------------------------------------------

export default function useLocales() {
  const { i18n, t } = useTranslation();

  const settings = useSettingsContext();

  const langStorage = localStorageGetItem('i18nextLng');
  const normalizedLang = langStorage === 'sr' ? 'sr-Latn' : langStorage;

  const currentLang = allLangs.find((lang) => lang.value === normalizedLang) || defaultLang;

  const onChangeLang = useCallback(
    (newlang: string) => {
      i18n.changeLanguage(newlang);
    },
    [i18n, settings]
  );

  return {
    allLangs,
    t,
    currentLang,
    onChangeLang,
  };
}
