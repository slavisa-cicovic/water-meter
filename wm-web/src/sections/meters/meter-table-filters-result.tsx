import { Chip, Stack } from '@mui/material';
import { useLocales } from 'src/locales';
import { IMeterTableFilters, IMeterTableFilterValue } from './meter-table-toolbar';

type Props = {
  filters: IMeterTableFilters;
  onFilters: (name: string, value: IMeterTableFilterValue) => void;
  onResetFilters: VoidFunction;
  results: number;
  sx?: any;
};

export function MeterTableFiltersResult({ filters, onFilters, onResetFilters, results, sx }: Props) {
  const { t } = useLocales();
  const statusLabelMap: Record<string, string> = {
    active: t('meters.status.active'),
    inactive: t('meters.status.inactive'),
    removed: t('meters.status.removed'),
  };
  const typeLabelMap: Record<string, string> = {
    automatic: t('meters.type.automatic'),
    mechanical: t('meters.type.mechanical'),
  };

  const chips: Array<{ key: string; label: string; onDelete: VoidFunction }> = [];

  if (filters.search) {
    chips.push({
      key: 'search',
      label: `${t('meters.filters.searchLabel')}: ${filters.search}`,
      onDelete: () => onFilters('search', ''),
    });
  }

  if (filters.status) {
    chips.push({
      key: 'status',
      label: `${t('meters.filters.statusLabel')}: ${statusLabelMap[filters.status] ?? filters.status}`,
      onDelete: () => onFilters('status', ''),
    });
  }

  if (filters.groupCode) {
    chips.push({
      key: 'groupCode',
      label: `${t('meters.filters.groupLabel')}: ${filters.groupCode}`,
      onDelete: () => onFilters('groupCode', ''),
    });
  }

  if (filters.type) {
    chips.push({
      key: 'type',
      label: `${t('meters.filters.typeLabel')}: ${typeLabelMap[filters.type] ?? filters.type}`,
      onDelete: () => onFilters('type', ''),
    });
  }

  if (filters.review) {
    chips.push({
      key: 'review',
      label: `${t('meters.filters.reviewLabel')}: ${t('meters.filters.reviewPending')}`,
      onDelete: () => onFilters('review', ''),
    });
  }

  return (
    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={sx}>
      {chips.map((chip) => (
        <Chip key={chip.key} label={chip.label} onDelete={chip.onDelete} />
      ))}
      <Chip label={`${t('meters.filters.results')}: ${results}`} variant="outlined" />
      <Chip label={t('meters.filters.reset')} color="primary" onClick={onResetFilters} />
    </Stack>
  );
}
