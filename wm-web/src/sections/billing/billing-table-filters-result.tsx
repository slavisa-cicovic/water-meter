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
    const reviewLabels: Record<string, string> = {
      non_positive_consumption: 'invalid_reading',
      no_reading_current_month: 'no_reading',
      invalid_household_size: 'no_household_size',
      no_previous_reading: 'no_previous_reading',
    };
    chips.push({
      key: 'review',
      label: `Review: ${reviewLabels[filters.review] || filters.review}`,
      onDelete: () => onFilters('review', ''),
    });
  }
  if (filters.createdStart) {
    chips.push({
      key: 'createdStart',
      label: `Created from: ${filters.createdStart}`,
      onDelete: () => onFilters('createdStart', ''),
    });
  }
  if (filters.createdEnd) {
    chips.push({
      key: 'createdEnd',
      label: `Created to: ${filters.createdEnd}`,
      onDelete: () => onFilters('createdEnd', ''),
    });
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
