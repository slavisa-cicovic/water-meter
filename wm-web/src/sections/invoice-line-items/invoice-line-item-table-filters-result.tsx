import { Chip, Stack } from '@mui/material';
import { useLocales } from 'src/locales';
import { IInvoiceLineItemTableFilters, IInvoiceLineItemTableFilterValue } from './invoice-line-item-table-toolbar';

type Props = {
  filters: IInvoiceLineItemTableFilters;
  defaultFilters?: IInvoiceLineItemTableFilters;
  onFilters: (name: string, value: IInvoiceLineItemTableFilterValue) => void;
  onResetFilters: VoidFunction;
  results: number;
  sx?: any;
};

export function InvoiceLineItemTableFiltersResult({
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
      label: t('billing.lineItems.filters.searchTag', { value: filters.search }),
      onDelete: () => onFilters('search', ''),
    });
  }
  if (filters.type && filters.type !== defaultFilters?.type) {
    const label =
      filters.type === 'percentage'
        ? t('billing.lineItems.type.percentage')
        : t('billing.lineItems.type.fixed');
    chips.push({
      key: 'type',
      label: t('billing.lineItems.filters.typeTag', { value: label }),
      onDelete: () => onFilters('type', ''),
    });
  }

  return (
    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={sx}>
      {chips.map((chip) => (
        <Chip key={chip.key} label={chip.label} onDelete={chip.onDelete} />
      ))}
      <Chip label={t('billing.lineItems.filters.results', { count: results })} variant="outlined" />
      <Chip label={t('billing.lineItems.filters.reset')} color="primary" onClick={onResetFilters} />
    </Stack>
  );
}
