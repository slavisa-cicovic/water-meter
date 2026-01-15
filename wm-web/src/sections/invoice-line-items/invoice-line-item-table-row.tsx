import { TableRow, TableCell, Stack, IconButton, Tooltip, Typography, Chip } from '@mui/material';
import Iconify from 'src/components/iconify';
import { InvoiceLineItem } from 'src/types/billings';
import { RouterLink } from 'src/routes/components';
import { paths } from 'src/routes/paths';
import { useLocales } from 'src/locales';
import { formatCurrencyValue } from 'src/utils/format-currency';

type Props = {
  row: InvoiceLineItem;
  currency?: string | null;
};

export function InvoiceLineItemTableRow({ row, currency }: Props) {
  const { t } = useLocales();
  const typeLabel = row.isPercentage ? t('billing.lineItems.type.percentage') : t('billing.lineItems.type.fixed');
  const numericValue = Number(row.value);
  const valueLabel = row.isPercentage
    ? `${Number.isFinite(numericValue) ? numericValue : row.value}%`
    : formatCurrencyValue(row.value, currency);

  return (
    <TableRow hover>
      <TableCell sx={{ minWidth: 200 }}>
        <Stack spacing={0.5}>
          <Typography variant="subtitle2">{row.name}</Typography>
          <Typography variant="body2" color="text.secondary">
            {row.description || '-'}
          </Typography>
        </Stack>
      </TableCell>
      <TableCell sx={{ width: 140 }}>
        <Chip size="small" label={typeLabel} />
      </TableCell>
      <TableCell sx={{ width: 140 }}>{valueLabel}</TableCell>
      <TableCell sx={{ width: 140 }}>{row.createdAt?.slice(0, 10) || '-'}</TableCell>
      <TableCell sx={{ width: 140 }}>{row.updatedAt?.slice(0, 10) || '-'}</TableCell>
      <TableCell align="right" sx={{ width: 120 }}>
        <Tooltip title={t('billing.lineItems.actions.detail')}>
          <IconButton size="small" component={RouterLink} href={paths.dashboard.billing.lineItems.details(row.id)}>
            <Iconify icon="eva:eye-fill" width={16} />
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
}
