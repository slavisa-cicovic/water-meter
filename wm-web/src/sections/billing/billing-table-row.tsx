import { TableRow, TableCell, Stack, IconButton, Tooltip, Chip, Typography, Box } from '@mui/material';
import Iconify from 'src/components/iconify';
import { Invoice } from 'src/types/billings';
import { RouterLink } from 'src/routes/components';
import { paths } from 'src/routes/paths';

type Props = {
  row: Invoice;
};

export function BillingTableRow({ row }: Props) {
  const hasPreviousReading = !row.reviewFlags?.includes('no_previous_reading');
  const periodEnd = row.periodEnd?.slice(0, 10) || '-';
  const periodStart = row.periodStart?.slice(0, 10) || '-';
  const period = hasPreviousReading && periodStart ? `${periodStart} → ${periodEnd}` : `→ ${periodEnd}`;

  return (
    <TableRow hover>
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
      <TableCell sx={{ minWidth: 200 }}>
        {hasPreviousReading ? (
          period
        ) : (
          <Box component="span" sx={{ pl: 6 }}>
            {period}
          </Box>
        )}
      </TableCell>
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
