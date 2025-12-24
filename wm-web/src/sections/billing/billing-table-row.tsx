import { TableRow, TableCell, Stack, IconButton, Tooltip, Chip } from '@mui/material';
import Iconify from 'src/components/iconify';
import { Invoice } from 'src/types/billings';
import { RouterLink } from 'src/routes/components';
import { paths } from 'src/routes/paths';

type Props = {
  row: Invoice;
};

export function BillingTableRow({ row }: Props) {
  const period = `${row.periodStart?.slice(0, 10)} → ${row.periodEnd?.slice(0, 10)}`;

  return (
    <TableRow hover>
      <TableCell sx={{ minWidth: 200 }}>{row.accountId}</TableCell>
      <TableCell sx={{ minWidth: 200 }}>{row.meter?.serialNumber || row.meterId || '-'}</TableCell>
      <TableCell sx={{ minWidth: 200 }}>{period}</TableCell>
      <TableCell sx={{ width: 120 }}>{row.consumption}</TableCell>
      <TableCell sx={{ width: 140 }}>{row.totalAmount}</TableCell>
      <TableCell sx={{ width: 120 }}>
        <Chip size="small" label={row.status} />
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
