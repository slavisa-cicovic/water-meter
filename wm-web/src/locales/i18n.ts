'use client';

import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
// utils
import { localStorageGetItem } from 'src/utils/storage-available';
//
import { defaultLang } from './config-lang';
//
import translationEn from './langs/en.json';
import translationSr from './langs/sr.json';
import translationSrCyrl from './langs/sr-Cyrl.json';
import translationSrLatn from './langs/sr-Latn.json';

// ----------------------------------------------------------------------

const storedLng = localStorageGetItem('i18nextLng', defaultLang.value);
const lng = storedLng === 'sr' ? 'sr-Latn' : storedLng;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translations: translationEn },
      sr: { translations: translationSr },
      'sr-Latn': { translations: translationSrLatn },
      'sr-Cyrl': { translations: translationSrCyrl },
    },
    lng,
    fallbackLng: defaultLang.value,
    supportedLngs: ['en', 'sr', 'sr-Latn', 'sr-Cyrl'],
    debug: false,
    ns: ['translations'],
    defaultNS: 'translations',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
