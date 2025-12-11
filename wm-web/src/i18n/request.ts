import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ request }) => {
  const defaultLocale = 'en';
  const locale = request.headers.get('x-locale') || defaultLocale;

  const supportedLocales = ['en', 'sr'];
  const normalizedLocale = supportedLocales.includes(locale) ? locale : defaultLocale;

  return {
    locale: normalizedLocale,
    messages: (await import(`./messages/${normalizedLocale}.json`)).default,
  };
});
