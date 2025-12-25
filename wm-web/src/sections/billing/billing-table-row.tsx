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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Divider,
} from '@mui/material';
import Iconify from 'src/components/iconify';
import { BillingApi } from 'src/api/billing';
import { Invoice } from 'src/types/billings';
import { RouterLink } from 'src/routes/components';
import { paths } from 'src/routes/paths';

type Props = {
  row: Invoice;
  selected?: boolean;
  onSelectRow?: VoidFunction;
  selectable?: boolean;
  onReviewed?: VoidFunction;
  isShared?: boolean;
};

export function BillingTableRow({ row, selected, onSelectRow, selectable = true, onReviewed, isShared = false }: Props) {
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
  const [prevValue, setPrevValue] = useState('0');
  const [prevReadAt, setPrevReadAt] = useState('');
  const [currentValue, setCurrentValue] = useState('0');
  const [currentReadAt, setCurrentReadAt] = useState('');
  const [editReason, setEditReason] = useState('');
  const [householdSize, setHouseholdSize] = useState('1');
  const [householdSizeError, setHouseholdSizeError] = useState('');
  const [reviewSaving, setReviewSaving] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [consumptionError, setConsumptionError] = useState('');
  const [currentReadAtError, setCurrentReadAtError] = useState('');
  const [editReasonError, setEditReasonError] = useState('');

  const toLocalDateTimeInput = (value: Date) => {
    const yyyy = value.getFullYear();
    const mm = String(value.getMonth() + 1).padStart(2, '0');
    const dd = String(value.getDate()).padStart(2, '0');
    const hh = String(value.getHours()).padStart(2, '0');
    const min = String(value.getMinutes()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
  };

  const handleOpenReviewDialog = () => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    setPrevValue('0');
    setPrevReadAt(toLocalDateTimeInput(startOfYear));
    setCurrentValue('0');
    setCurrentReadAt(toLocalDateTimeInput(now));
    setEditReason('');
    setHouseholdSize(String(row.account?.consumerProfile?.householdSize ?? 1));
    setHouseholdSizeError('');
    setReviewError('');
    setConsumptionError('');
    setCurrentReadAtError('');
    setEditReasonError('');
    setReviewDialogOpen(true);
  };

  const handleCloseReviewDialog = () => {
    setReviewDialogOpen(false);
  };

  const handleSaveReview = async () => {
    const prevNumeric = Number(prevValue);
    const currentNumeric = Number(currentValue);
    const consumption = currentNumeric - prevNumeric;
    const householdNumeric = Number(householdSize);
    const prevReadAtDate = new Date(prevReadAt);
    const currentReadAtDate = new Date(currentReadAt);
    const now = new Date();

    let hasError = false;
    setReviewError('');

    if (!Number.isFinite(consumption) || consumption <= 0) {
      setConsumptionError('Consumption must be greater than 0.');
      hasError = true;
    } else {
      setConsumptionError('');
    }

    if (!editReason.trim()) {
      setEditReasonError('Edit reason is required.');
      hasError = true;
    } else {
      setEditReasonError('');
    }

    if (isShared && (!Number.isFinite(householdNumeric) || householdNumeric <= 0)) {
      setHouseholdSizeError('Household size must be greater than 0.');
      hasError = true;
    } else {
      setHouseholdSizeError('');
    }

    if (
      Number.isNaN(currentReadAtDate.getTime()) ||
      currentReadAtDate > now ||
      (prevReadAt && currentReadAtDate < prevReadAtDate)
    ) {
      let message = 'Current read time cannot be in the future.';
      if (prevReadAt && currentReadAtDate < prevReadAtDate) {
        message = 'Current read time must be after previous read time.';
      }
      setCurrentReadAtError(message);
      hasError = true;
    } else {
      setCurrentReadAtError('');
    }

    if (hasError) return;

    setReviewSaving(true);
    try {
      await BillingApi.reviewInvoiceReadings(row.id, {
        previous: { value: prevNumeric, readAt: prevReadAt },
        current: { value: currentNumeric, readAt: currentReadAt },
        reason: editReason.trim(),
        householdSize: isShared ? householdNumeric : undefined,
      });
      if (onReviewed) onReviewed();
      setReviewDialogOpen(false);
    } catch (error) {
      setReviewError('Failed to save review.');
    } finally {
      setReviewSaving(false);
    }
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

      <Dialog open={reviewDialogOpen} onClose={handleCloseReviewDialog} fullWidth maxWidth="sm">
        <DialogTitle>Edit readings</DialogTitle>
        <DialogContent>
          {row.account && (
            <Stack spacing={0.5} mb={2}>
              <Typography variant="overline" color="text.secondary">
                Consumer
              </Typography>
              <Typography variant="subtitle2">
                {row.account.firstName} {row.account.lastName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {row.account.address}
              </Typography>
            </Stack>
          )}
          {row.account && <Divider sx={{ mb: 2 }} />}
          <Stack spacing={2} mt={1}>
            <Typography variant="subtitle2">Previous reading</Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Value"
                type="number"
                value={prevValue}
                onChange={(event) => setPrevValue(event.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
                fullWidth
              />
              <TextField
                label="Read at"
                type="datetime-local"
                value={prevReadAt}
                onChange={(event) => setPrevReadAt(event.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
                fullWidth
              />
            </Stack>

            <Typography variant="subtitle2">Current reading</Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Value"
                type="number"
                value={currentValue}
                onChange={(event) => setCurrentValue(event.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
                error={Boolean(consumptionError)}
                helperText={consumptionError || 'Consumption must be greater than 0.'}
                fullWidth
              />
              <TextField
                label="Read at"
                type="datetime-local"
                value={currentReadAt}
                onChange={(event) => setCurrentReadAt(event.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
                error={Boolean(currentReadAtError)}
                helperText={currentReadAtError || 'Must be now or earlier.'}
                fullWidth
              />
            </Stack>

            <TextField
              label="Edit reason"
              value={editReason}
              onChange={(event) => setEditReason(event.target.value)}
              error={Boolean(editReasonError)}
              helperText={editReasonError || 'Required'}
              multiline
              minRows={2}
              fullWidth
            />
            {isShared && (
              <TextField
                label="Household size"
                type="number"
                value={householdSize}
                onChange={(event) => setHouseholdSize(event.target.value)}
                error={Boolean(householdSizeError)}
                helperText={householdSizeError || 'Must be greater than 0.'}
                fullWidth
              />
            )}
            {reviewError && (
              <Typography variant="body2" color="error">
                {reviewError}
              </Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseReviewDialog} disabled={reviewSaving}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSaveReview} disabled={reviewSaving}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
