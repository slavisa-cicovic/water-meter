import { getRequestConfig } from 'next-intl/server';
import { headers } from 'next/headers';

export default getRequestConfig(async () => {
  const defaultLocale = 'en';
  const locale = (await headers()).get('x-locale') || defaultLocale;

  const supportedLocales = ['en', 'sr', 'sr-Latn', 'sr-Cyrl'];
  const normalizedLocale = supportedLocales.includes(locale) ? locale : defaultLocale;

  return {
    locale: normalizedLocale,
    messages: (await import(`./messages/${normalizedLocale}.json`)).default,
  };
});
