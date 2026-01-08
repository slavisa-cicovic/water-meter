// @mui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack, { StackProps } from '@mui/material/Stack';
import { useLocales } from 'src/locales';
// components
import Iconify from 'src/components/iconify';
// types
import { IAccountTableFilters, IAccountTableFilterValue } from 'src/types/accounts';

// ----------------------------------------------------------------------

type Props = StackProps & {
  filters: IAccountTableFilters;
  onFilters: (name: string, value: IAccountTableFilterValue) => void;
  //
  onResetFilters: VoidFunction;
  //
  results: number;
};

export default function AccountTableFiltersResult({
  filters,
  onFilters,
  //
  onResetFilters,
  //
  results,
  ...other
}: Props) {
  const { t } = useLocales();
  const typeLabelMap: Record<string, string> = {
    consumer: t('accounts.type.consumer'),
    staff: t('accounts.type.staff'),
    staff_field: t('accounts.type.staffField'),
    staff_backoffice: t('accounts.type.staffBackoffice'),
  };
  const statusLabelMap: Record<string, string> = {
    pending: t('accounts.status.pending'),
    verified: t('accounts.status.verified'),
    rejected: t('accounts.status.rejected'),
  };

  return (
    <Stack spacing={1.5} {...other}>
      <Box sx={{ typography: 'body2' }}>
        <strong>{results}</strong>
        <Box component="span" sx={{ color: 'text.secondary', ml: 0.5 }}>
          {t('accounts.filters.found')}
        </Box>
      </Box>

      <Stack flexGrow={1} spacing={1} direction="row" flexWrap="wrap" alignItems="center">
        {filters.name && (
          <Button size="small" variant="outlined" onClick={() => onFilters('name', '')}>
            {t('accounts.filters.nameLabel')}: {filters.name}
          </Button>
        )}
        {filters.type && (
          <Button size="small" variant="outlined" onClick={() => onFilters('type', '')}>
            {t('accounts.filters.typeLabel')}: {typeLabelMap[filters.type] ?? filters.type}
          </Button>
        )}
        {filters.status && (
          <Button size="small" variant="outlined" onClick={() => onFilters('status', '')}>
            {t('accounts.filters.statusLabel')}: {statusLabelMap[filters.status] ?? filters.status}
          </Button>
        )}
        <Button
          color="error"
          onClick={onResetFilters}
          startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
        >
          {t('accounts.filters.clear')}
        </Button>
      </Stack>
    </Stack>
  );
}
