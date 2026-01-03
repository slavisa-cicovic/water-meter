export const formatReadingValue = (value: number | null | undefined) => {
  if (value === null || value === undefined || Number.isNaN(value)) return '-';
  return value.toFixed(2);
};
