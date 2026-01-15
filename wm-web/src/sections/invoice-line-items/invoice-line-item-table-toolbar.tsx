import React, { useCallback } from 'react';
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import { useLocales } from 'src/locales';

export type IInvoiceLineItemTableFilterValue = string;

export type IInvoiceLineItemTableFilters = {
  search: string;
  type: string;
};

type Props = {
  filters: IInvoiceLineItemTableFilters;
  onFilters: (name: string, value: IInvoiceLineItemTableFilterValue) => void;
};

export function InvoiceLineItemTableToolbar({ filters, onFilters }: Props) {
  const { t } = useLocales();
  const handleChange = useCallback(
    (name: keyof IInvoiceLineItemTableFilters) => (event: React.ChangeEvent<HTMLInputElement>) => {
      onFilters(name, event.target.value);
    },
    [onFilters]
  );

  return (
    <Stack
      spacing={2}
      alignItems={{ xs: 'flex-end', md: 'center' }}
      direction={{ xs: 'column', md: 'row' }}
      sx={{ p: 2.5, pr: { xs: 2.5, md: 2.5 } }}
    >
      <Stack direction="row" alignItems="center" spacing={2} flexGrow={1} sx={{ width: 1 }}>
        <TextField
          label={t('billing.lineItems.filters.searchLabel')}
          value={filters.search}
          onChange={handleChange('search')}
          sx={{ flexGrow: 1, minWidth: 220 }}
        />
        <TextField
          select
          label={t('billing.lineItems.filters.typeLabel')}
          value={filters.type}
          onChange={handleChange('type')}
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="">{t('billing.lineItems.filters.all')}</MenuItem>
          <MenuItem value="percentage">{t('billing.lineItems.type.percentage')}</MenuItem>
          <MenuItem value="fixed">{t('billing.lineItems.type.fixed')}</MenuItem>
        </TextField>
      </Stack>
    </Stack>
  );
}
