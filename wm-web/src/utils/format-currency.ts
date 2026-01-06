type InputValue = number | string | null | undefined;

const DEFAULT_CURRENCY = 'RSD';
const LOCALE_BY_CURRENCY: Record<string, string> = {
  RSD: 'sr-RS',
  USD: 'en-US',
  EUR: 'de-DE',
};

export const formatCurrencyValue = (value: InputValue, currency?: string | null) => {
  if (value === null || value === undefined || value === '') return '-';

  const numeric = typeof value === 'string' ? Number(value) : value;
  if (!Number.isFinite(numeric)) {
    return typeof value === 'string' && value.trim() ? value : '-';
  }

  const resolvedCurrency = (currency || DEFAULT_CURRENCY).toUpperCase();
  const locale = LOCALE_BY_CURRENCY[resolvedCurrency] || 'en-US';

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: resolvedCurrency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
      .format(numeric)
      .replace(/\u00A0/g, ' ');
  } catch (error) {
    return `${numeric.toFixed(2)} ${resolvedCurrency}`;
  }
};
