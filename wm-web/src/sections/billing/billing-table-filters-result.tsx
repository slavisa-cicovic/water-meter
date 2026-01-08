import { Chip, Stack } from '@mui/material';
import { IBillingTableFilters, IBillingTableFilterValue } from './billing-table-toolbar';
import { useLocales } from 'src/locales';

type Props = {
  filters: IBillingTableFilters;
  defaultFilters?: IBillingTableFilters;
  onFilters: (name: string, value: IBillingTableFilterValue) => void;
  onResetFilters: VoidFunction;
  results: number;
  sx?: any;
};

export function BillingTableFiltersResult({
  filters,
  defaultFilters,
  onFilters,
  onResetFilters,
  results,
  sx,
}: Props) {
  const { t } = useLocales();
  const chips: Array<{ key: string; label: string; onDelete: VoidFunction }> = [];

  if (filters.search) {
    chips.push({
      key: 'search',
      label: t('billing.filters.searchTag', { value: filters.search }),
      onDelete: () => onFilters('search', ''),
    });
  }
  if (filters.status) {
    const statusLabel = t(`billing.status.${filters.status}`, { defaultValue: filters.status });
    chips.push({
      key: 'status',
      label: t('billing.filters.statusTag', { value: statusLabel }),
      onDelete: () => onFilters('status', ''),
    });
  }
  if (filters.review) {
    const reviewLabels: Record<string, string> = {
      no_flags: t('billing.reviewFlags.noFlags'),
      invalid_reading: t('billing.reviewFlags.invalidReading'),
      no_reading: t('billing.reviewFlags.noReading'),
      no_previous_reading: t('billing.reviewFlags.noPreviousReading'),
      no_household_size: t('billing.reviewFlags.noHouseholdSize'),
    };
    chips.push({
      key: 'review',
      label: t('billing.filters.reviewTag', { value: reviewLabels[filters.review] || filters.review }),
      onDelete: () => onFilters('review', ''),
    });
  }
  if (filters.createdStart && filters.createdStart !== defaultFilters?.createdStart) {
    chips.push({
      key: 'createdStart',
      label: t('billing.filters.createdFromTag', { value: filters.createdStart }),
      onDelete: () => onFilters('createdStart', ''),
    });
  }
  if (filters.createdEnd && filters.createdEnd !== defaultFilters?.createdEnd) {
    chips.push({
      key: 'createdEnd',
      label: t('billing.filters.createdToTag', { value: filters.createdEnd }),
      onDelete: () => onFilters('createdEnd', ''),
    });
  }

  return (
    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={sx}>
      {chips.map((chip) => (
        <Chip key={chip.key} label={chip.label} onDelete={chip.onDelete} />
      ))}
      <Chip label={t('billing.filters.results', { count: results })} variant="outlined" />
      <Chip label={t('billing.filters.reset')} color="primary" onClick={onResetFilters} />
    </Stack>
  );
}
