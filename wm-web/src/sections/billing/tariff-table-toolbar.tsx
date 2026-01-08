import React, { useCallback } from 'react';
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import { useLocales } from 'src/locales';

export type ITariffTableFilterValue = string;

export type ITariffTableFilters = {
  search: string;
  status: string;
};

type Props = {
  filters: ITariffTableFilters;
  onFilters: (name: string, value: ITariffTableFilterValue) => void;
};

export function TariffTableToolbar({ filters, onFilters }: Props) {
  const { t } = useLocales();
  const handleChange = useCallback(
    (name: keyof ITariffTableFilters) => (event: React.ChangeEvent<HTMLInputElement>) => {
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
          label={t('billing.tariffs.filters.searchLabel')}
          value={filters.search}
          onChange={handleChange('search')}
          sx={{ flexGrow: 1, minWidth: 220 }}
        />
        <TextField
          select
          label={t('billing.tariffs.filters.statusLabel')}
          value={filters.status}
          onChange={handleChange('status')}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">{t('billing.tariffs.filters.all')}</MenuItem>
          <MenuItem value="active">{t('billing.tariffs.status.active')}</MenuItem>
          <MenuItem value="inactive">{t('billing.tariffs.status.inactive')}</MenuItem>
        </TextField>
      </Stack>
    </Stack>
  );
}
