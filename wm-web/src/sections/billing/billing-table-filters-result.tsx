import { Chip, Stack } from '@mui/material';
import { IBillingTableFilters, IBillingTableFilterValue } from './billing-table-toolbar';

type Props = {
  filters: IBillingTableFilters;
  onFilters: (name: string, value: IBillingTableFilterValue) => void;
  onResetFilters: VoidFunction;
  results: number;
  sx?: any;
};

export function BillingTableFiltersResult({ filters, onFilters, onResetFilters, results, sx }: Props) {
  const chips: Array<{ key: string; label: string; onDelete: VoidFunction }> = [];

  if (filters.accountId) {
    chips.push({ key: 'accountId', label: `Account: ${filters.accountId}`, onDelete: () => onFilters('accountId', '') });
  }
  if (filters.meterId) {
    chips.push({ key: 'meterId', label: `Meter: ${filters.meterId}`, onDelete: () => onFilters('meterId', '') });
  }
  if (filters.status) {
    chips.push({ key: 'status', label: `Status: ${filters.status}`, onDelete: () => onFilters('status', '') });
  }
  if (filters.review) {
    const label =
      filters.review === 'none'
        ? 'Review: no flags'
        : filters.review === 'non_positive_consumption'
        ? 'Review: invalid_reading'
        : filters.review === 'no_reading_current_month'
        ? 'Review: no_reading'
        : filters.review === 'invalid_household_size'
        ? 'Review: no_household_size'
        : `Review: ${filters.review}`;
    chips.push({
      key: 'review',
      label,
      onDelete: () => onFilters('review', ''),
    });
  }
  if (filters.periodStart) {
    chips.push({ key: 'periodStart', label: `From: ${filters.periodStart}`, onDelete: () => onFilters('periodStart', '') });
  }
  if (filters.periodEnd) {
    chips.push({ key: 'periodEnd', label: `To: ${filters.periodEnd}`, onDelete: () => onFilters('periodEnd', '') });
  }

  return (
    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={sx}>
      {chips.map((chip) => (
        <Chip key={chip.key} label={chip.label} onDelete={chip.onDelete} />
      ))}
      <Chip label={`Results: ${results}`} variant="outlined" />
      <Chip label="Reset" color="primary" onClick={onResetFilters} />
    </Stack>
  );
}
