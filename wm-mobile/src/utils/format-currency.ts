type InputValue = number | string | null | undefined;

const DEFAULT_CURRENCY = "RSD";
const LOCALE_BY_CURRENCY: Record<string, string> = {
  RSD: "sr-RS",
  USD: "en-US",
  EUR: "de-DE",
};

const formatNumberEnUS = (value: number) => {
  const sign = value < 0 ? "-" : "";
  const fixed = Math.abs(value).toFixed(2);
  const [whole, fraction] = fixed.split(".");
  const withCommas = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${sign}${withCommas}.${fraction}`;
};

export const formatCurrencyValue = (value: InputValue, currency?: string | null) => {
  if (value === null || value === undefined || value === "") return "-";

  const numeric = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(numeric)) {
    return typeof value === "string" && value.trim() ? value : "-";
  }

  const resolvedCurrency = (currency || DEFAULT_CURRENCY).trim().toUpperCase();
  const locale = LOCALE_BY_CURRENCY[resolvedCurrency] || "en-US";

  try {
    if (resolvedCurrency === "USD") {
      return `$${formatNumberEnUS(numeric)}`;
    }
    if (resolvedCurrency === "RSD") {
      const formatted = new Intl.NumberFormat(locale, {
        style: "decimal",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
        .format(numeric)
        .replace(/\u00A0/g, " ");
      return `${formatted} RSD`;
    }

    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: resolvedCurrency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
      .format(numeric)
      .replace(/\u00A0/g, " ");
  } catch (error) {
    if (resolvedCurrency === "USD") {
      return `$${formatNumberEnUS(numeric)}`;
    }
    return `${numeric.toFixed(2)} ${resolvedCurrency}`;
  }
};
