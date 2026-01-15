import React, { useCallback } from 'react';
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import { useLocales } from 'src/locales';

export type IInvoiceTableFilterValue = string;

export type IInvoiceTableFilters = {
  search: string;
  status: string;
  review: string;
  createdStart: string;
  createdEnd: string;
  periodEndStart: string;
  periodEndEnd: string;
};

type Props = {
  filters: IInvoiceTableFilters;
  onFilters: (name: string, value: IInvoiceTableFilterValue) => void;
};

export function InvoiceTableToolbar({ filters, onFilters }: Props) {
  const { t } = useLocales();
  const handleChange = useCallback(
    (name: keyof IInvoiceTableFilters) => (event: React.ChangeEvent<HTMLInputElement>) => {
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
          label={t('billing.filters.searchLabel')}
          value={filters.search}
          onChange={handleChange('search')}
          sx={{ flexGrow: 1, minWidth: 220 }}
        />
        <TextField
          select
          label={t('billing.filters.statusLabel')}
          value={filters.status}
          onChange={handleChange('status')}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">{t('billing.filters.all')}</MenuItem>
          <MenuItem value="draft">{t('billing.status.draft')}</MenuItem>
          <MenuItem value="confirmed">{t('billing.status.confirmed')}</MenuItem>
          <MenuItem value="issued">{t('billing.status.issued')}</MenuItem>
          <MenuItem value="paid">{t('billing.status.paid')}</MenuItem>
          <MenuItem value="void">{t('billing.status.void')}</MenuItem>
        </TextField>
        <TextField
          select
          label={t('billing.filters.reviewLabel')}
          value={filters.review}
          onChange={handleChange('review')}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="">{t('billing.filters.all')}</MenuItem>
          <MenuItem value="no_flags">{t('billing.reviewFlags.noFlags')}</MenuItem>
          <MenuItem value="invalid_reading">{t('billing.reviewFlags.invalidReading')}</MenuItem>
          <MenuItem value="no_reading">{t('billing.reviewFlags.noReading')}</MenuItem>
          <MenuItem value="no_previous_reading">{t('billing.reviewFlags.noPreviousReading')}</MenuItem>
          <MenuItem value="no_household_size">{t('billing.reviewFlags.noHouseholdSize')}</MenuItem>
        </TextField>
        <TextField
          label={t('billing.filters.createdFrom')}
          type="date"
          value={filters.createdStart}
          onChange={handleChange('createdStart')}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 160 }}
        />
        <TextField
          label={t('billing.filters.createdTo')}
          type="date"
          value={filters.createdEnd}
          onChange={handleChange('createdEnd')}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 160 }}
        />
        <TextField
          label={t('billing.filters.periodEndFrom')}
          type="date"
          value={filters.periodEndStart}
          onChange={handleChange('periodEndStart')}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 170 }}
        />
        <TextField
          label={t('billing.filters.periodEndTo')}
          type="date"
          value={filters.periodEndEnd}
          onChange={handleChange('periodEndEnd')}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 170 }}
        />
      </Stack>
    </Stack>
  );
}
