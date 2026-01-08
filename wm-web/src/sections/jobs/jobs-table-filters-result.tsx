import { Chip, Stack } from '@mui/material';
import { IJobsTableFilters, IJobsTableFilterValue } from './jobs-table-toolbar';
import { useLocales } from 'src/locales';

type Props = {
  filters: IJobsTableFilters;
  onFilters: (name: string, value: IJobsTableFilterValue) => void;
  onResetFilters: VoidFunction;
  results: number;
  sx?: any;
};

export function JobsTableFiltersResult({ filters, onFilters, onResetFilters, results, sx }: Props) {
  const { t } = useLocales();
  const chips: Array<{ key: string; label: string; onDelete: VoidFunction }> = [];

  if (filters.search) {
    chips.push({
      key: 'search',
      label: t('jobs.filters.searchTag', { value: filters.search }),
      onDelete: () => onFilters('search', ''),
    });
  }
  if (filters.status) {
    const statusLabel = t(`jobs.status.${filters.status}`, { defaultValue: filters.status });
    chips.push({
      key: 'status',
      label: t('jobs.filters.statusTag', { value: statusLabel }),
      onDelete: () => onFilters('status', ''),
    });
  }

  return (
    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={sx}>
      {chips.map((chip) => (
        <Chip key={chip.key} label={chip.label} onDelete={chip.onDelete} />
      ))}
      <Chip label={t('jobs.filters.results', { count: results })} variant="outlined" />
      <Chip label={t('jobs.filters.reset')} color="primary" onClick={onResetFilters} />
    </Stack>
  );
}
