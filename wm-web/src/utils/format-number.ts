// ----------------------------------------------------------------------

type InputValue = string | number | null;

const toNumber = (value: InputValue): number | null => {
  if (value === null || value === undefined) return null;
  const numeric = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(numeric) ? numeric : null;
};

export function fNumber(number: InputValue) {
  const value = toNumber(number);
  if (value === null) return '';
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 20 }).format(value);
}

export function fCurrency(number: InputValue) {
  if (!number) return '';
  const value = toNumber(number);
  if (value === null) return '';
  const format = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

  return result(format, '.00');
}

export function fPercent(number: InputValue) {
  if (!number) return '';
  const value = toNumber(number);
  if (value === null) return '';
  const format = new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value / 100);

  return result(format, '.0');
}

export function fShortenNumber(number: InputValue) {
  if (!number) return '';
  const value = toNumber(number);
  if (value === null) return '';
  const format = formatShortNumber(value);

  return result(format, '.00');
}

export function fData(number: InputValue) {
  if (!number) return '';
  const value = toNumber(number);
  if (value === null) return '';
  const format = formatBytes(value);

  return result(format, '.0');
}

function formatShortNumber(value: number) {
  const absValue = Math.abs(value);
  const units = ['', 'k', 'm', 'b', 't'];
  let unitIndex = 0;
  let shortValue = absValue;

  while (shortValue >= 1000 && unitIndex < units.length - 1) {
    shortValue /= 1000;
    unitIndex += 1;
  }

  const formatted = shortValue.toFixed(2);
  const signed = value < 0 ? '-' : '';
  return `${signed}${formatted}${units[unitIndex]}`;
}

function formatBytes(value: number) {
  const absValue = Math.abs(value);
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  let unitIndex = 0;
  let shortValue = absValue;

  while (shortValue >= 1024 && unitIndex < units.length - 1) {
    shortValue /= 1024;
    unitIndex += 1;
  }

  const formatted = shortValue.toFixed(1);
  const signed = value < 0 ? '-' : '';
  return `${signed}${formatted} ${units[unitIndex]}`;
}

function result(format: string, key = '.00') {
  const isInteger = format.includes(key);

  return isInteger ? format.replace(key, '') : format;
}
