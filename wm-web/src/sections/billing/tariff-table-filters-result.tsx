import { Chip, Stack } from '@mui/material';
import { ITariffTableFilters, ITariffTableFilterValue } from './tariff-table-toolbar';
import { useLocales } from 'src/locales';

type Props = {
  filters: ITariffTableFilters;
  onFilters: (name: string, value: ITariffTableFilterValue) => void;
  onResetFilters: VoidFunction;
  results: number;
  sx?: any;
};

export function TariffTableFiltersResult({ filters, onFilters, onResetFilters, results, sx }: Props) {
  const { t } = useLocales();
  const chips: Array<{ key: string; label: string; onDelete: VoidFunction }> = [];

  if (filters.search) {
    chips.push({
      key: 'search',
      label: t('billing.tariffs.filters.searchTag', { value: filters.search }),
      onDelete: () => onFilters('search', ''),
    });
  }
  if (filters.status) {
    const statusLabel = t(`billing.tariffs.status.${filters.status}`, { defaultValue: filters.status });
    chips.push({
      key: 'status',
      label: t('billing.tariffs.filters.statusTag', { value: statusLabel }),
      onDelete: () => onFilters('status', ''),
    });
  }

  return (
    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={sx}>
      {chips.map((chip) => (
        <Chip key={chip.key} label={chip.label} onDelete={chip.onDelete} />
      ))}
      <Chip label={t('billing.tariffs.filters.results', { count: results })} variant="outlined" />
      <Chip label={t('billing.tariffs.filters.reset')} color="primary" onClick={onResetFilters} />
    </Stack>
  );
}
