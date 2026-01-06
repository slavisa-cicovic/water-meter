import { useState } from 'react';
import {
  TableRow,
  TableCell,
  Stack,
  IconButton,
  Tooltip,
  Chip,
  Typography,
  Checkbox,
} from '@mui/material';
import Iconify from 'src/components/iconify';
import { Invoice } from 'src/types/billings';
import { RouterLink } from 'src/routes/components';
import { paths } from 'src/routes/paths';
import { ReadingsReviewDialog } from 'src/components/billing/readings-review-dialog';
import { formatCurrencyValue } from 'src/utils/format-currency';

type Props = {
  row: Invoice;
  selected?: boolean;
  onSelectRow?: VoidFunction;
  selectable?: boolean;
  onReviewed?: VoidFunction;
  isShared?: boolean;
  currency?: string | null;
};

export function BillingTableRow({
  row,
  selected,
  onSelectRow,
  selectable = true,
  onReviewed,
  isShared = false,
  currency,
}: Props) {
  const toLocalDate = (value?: string | null) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };
  const periodEnd = toLocalDate(row.periodEnd);
  const periodStart = toLocalDate(row.periodStart);
  const period = periodStart || periodEnd ? `${periodStart} → ${periodEnd}`.trim() : '';
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);

  const handleOpenReviewDialog = () => {
    setReviewDialogOpen(true);
  };

  const handleCloseReviewDialog = () => {
    setReviewDialogOpen(false);
  };

  return (
    <>
      <TableRow hover>
        <TableCell padding="checkbox">
          <Checkbox checked={!!selected} onChange={onSelectRow} disabled={!selectable} />
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
        <TableCell sx={{ width: 140 }}>{formatCurrencyValue(row.totalAmount, currency)}</TableCell>
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
        <TableCell align="right" sx={{ width: 140 }}>
          <Stack direction="row" justifyContent="flex-end" spacing={1}>
            {row.reviewFlags && row.reviewFlags.length > 0 && (
              <Tooltip
                title={
                  <Stack spacing={0.5} sx={{ py: 0.5 }}>
                    {row.reviewFlags.map((flag) => (
                      <Typography key={flag} variant="caption" display="block">
                        {flag}
                      </Typography>
                    ))}
                  </Stack>
                }
              >
                <IconButton size="small" color="warning" onClick={handleOpenReviewDialog}>
                  <Iconify icon="eva:alert-circle-fill" width={16} />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Invoice detail">
              <IconButton size="small" component={RouterLink} href={paths.dashboard.billing.invoice(row.id)}>
                <Iconify icon="eva:eye-fill" width={16} />
              </IconButton>
            </Tooltip>
          </Stack>
        </TableCell>
      </TableRow>

      <ReadingsReviewDialog
        open={reviewDialogOpen}
        onClose={handleCloseReviewDialog}
        invoice={row}
        isShared={isShared}
        onReviewed={onReviewed}
      />
    </>
  );
}
