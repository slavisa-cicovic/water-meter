import { TableRow, TableCell, Stack, IconButton, Tooltip, Chip, Typography, Box, Checkbox } from '@mui/material';
import Iconify from 'src/components/iconify';
import { Invoice } from 'src/types/billings';
import { RouterLink } from 'src/routes/components';
import { paths } from 'src/routes/paths';

type Props = {
  row: Invoice;
  selected?: boolean;
  onSelectRow?: VoidFunction;
  selectable?: boolean;
};

export function BillingTableRow({ row, selected, onSelectRow, selectable = true }: Props) {
  const periodEnd = row.periodEnd?.slice(0, 10) || '';
  const periodStart = row.periodStart?.slice(0, 10) || '';
  const period = periodStart || periodEnd ? `${periodStart} → ${periodEnd}`.trim() : '';

  return (
    <TableRow hover>
      <TableCell padding="checkbox">
        <Checkbox
          checked={!!selected}
          onChange={onSelectRow}
          disabled={!selectable}
        />
      </TableCell>
      <TableCell sx={{ minWidth: 200 }}>
        {row.account ? (
          <Stack spacing={0.5}>
            <Typography variant="subtitle2">
              {row.account.firstName} {row.account.lastName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {row.account.address}
            </Typography>
          </Stack>
        ) : (
          row.accountId
        )}
      </TableCell>
      <TableCell sx={{ minWidth: 200 }}>{row.meter?.serialNumber || row.meterId || '-'}</TableCell>
      <TableCell sx={{ minWidth: 200 }}>{period}</TableCell>
      <TableCell sx={{ width: 160 }}>{row.createdAt?.slice(0, 10) || '-'}</TableCell>
      <TableCell sx={{ width: 160 }}>{row.updatedAt?.slice(0, 10) || '-'}</TableCell>
      <TableCell sx={{ width: 120 }}>{row.consumption}</TableCell>
      <TableCell sx={{ width: 140 }}>{row.totalAmount}</TableCell>
      <TableCell sx={{ width: 120 }}>
        <Chip
          size="small"
          label={row.status}
          color={
            row.status === 'paid'
              ? 'success'
              : row.status === 'confirmed'
              ? 'secondary'
              : row.status === 'issued'
              ? 'info'
              : row.status === 'void'
              ? 'default'
              : 'warning'
          }
        />
      </TableCell>
      <TableCell sx={{ width: 140 }}>
        {row.reviewFlags && row.reviewFlags.length > 0 ? (
          <Tooltip title={row.reviewFlags.join(', ')}>
            <Chip size="small" color="error" label="Review" />
          </Tooltip>
        ) : (
          '-'
        )}
      </TableCell>
      <TableCell align="right" sx={{ width: 140 }}>
        <Stack direction="row" justifyContent="flex-end" spacing={1}>
          <Tooltip title="Invoice detail">
            <IconButton size="small" component={RouterLink} href={paths.dashboard.billing.invoice(row.id)}>
              <Iconify icon="eva:eye-fill" width={16} />
            </IconButton>
          </Tooltip>
        </Stack>
      </TableCell>
    </TableRow>
  );
}
