import { useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { BillingApi } from 'src/api/billing';
import { Invoice } from 'src/types/billings';
import { useLocales } from 'src/locales';

type Props = {
  open: boolean;
  onClose: VoidFunction;
  invoice: Invoice | null;
  isShared?: boolean;
  onReviewed?: VoidFunction;
};

const toLocalDateTimeInput = (value: Date) => {
  const yyyy = value.getFullYear();
  const mm = String(value.getMonth() + 1).padStart(2, '0');
  const dd = String(value.getDate()).padStart(2, '0');
  const hh = String(value.getHours()).padStart(2, '0');
  const min = String(value.getMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
};

export function ReadingsReviewDialog({ open, onClose, invoice, isShared = false, onReviewed }: Props) {
  const { t } = useLocales();
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

  useEffect(() => {
    if (!open || !invoice) return;
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    setPrevValue('0');
    setPrevReadAt(toLocalDateTimeInput(startOfYear));
    setCurrentValue('0');
    setCurrentReadAt(toLocalDateTimeInput(now));
    setEditReason('');
    setHouseholdSize(String(invoice.account?.consumerProfile?.householdSize ?? 1));
    setHouseholdSizeError('');
    setReviewError('');
    setConsumptionError('');
    setCurrentReadAtError('');
    setEditReasonError('');
  }, [open, invoice]);

  const handleSaveReview = async () => {
    if (!invoice) return;
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
      setConsumptionError(t('billing.reviewDialog.errors.consumptionMin'));
      hasError = true;
    } else {
      setConsumptionError('');
    }

    if (!editReason.trim()) {
      setEditReasonError(t('billing.reviewDialog.errors.editReasonRequired'));
      hasError = true;
    } else {
      setEditReasonError('');
    }

    if (isShared && (!Number.isFinite(householdNumeric) || householdNumeric <= 0)) {
      setHouseholdSizeError(t('billing.reviewDialog.errors.householdSizeMin'));
      hasError = true;
    } else {
      setHouseholdSizeError('');
    }

    if (
      Number.isNaN(currentReadAtDate.getTime()) ||
      currentReadAtDate > now ||
      (prevReadAt && currentReadAtDate < prevReadAtDate)
    ) {
      let message = t('billing.reviewDialog.errors.readAtFuture');
      if (prevReadAt && currentReadAtDate < prevReadAtDate) {
        message = t('billing.reviewDialog.errors.readAtAfterPrevious');
      }
      setCurrentReadAtError(message);
      hasError = true;
    } else {
      setCurrentReadAtError('');
    }

    if (hasError) return;

    setReviewSaving(true);
    try {
      await BillingApi.reviewInvoiceReadings(invoice.id, {
        previous: { value: prevNumeric, readAt: prevReadAt },
        current: { value: currentNumeric, readAt: currentReadAt },
        reason: editReason.trim(),
        householdSize: isShared ? householdNumeric : undefined,
      });
      if (onReviewed) onReviewed();
      onClose();
    } catch (error) {
      setReviewError(t('billing.reviewDialog.errors.saveFailed'));
    } finally {
      setReviewSaving(false);
    }
  };

  if (!invoice) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{t('billing.reviewDialog.title')}</DialogTitle>
      <DialogContent>
        {invoice.account && (
          <Stack spacing={0.5} mb={2}>
            <Typography variant="overline" color="text.secondary">
              {t('billing.reviewDialog.consumer')}
            </Typography>
            <Typography variant="subtitle2">
              {invoice.account.firstName} {invoice.account.lastName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {invoice.account.address}
            </Typography>
          </Stack>
        )}
        {invoice.account && <Divider sx={{ mb: 2 }} />}
        <Stack spacing={2} mt={1}>
          <Typography variant="subtitle2">{t('billing.reviewDialog.previousReading')}</Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label={t('billing.reviewDialog.fields.value')}
              type="number"
              value={prevValue}
              onChange={(event) => setPrevValue(event.target.value)}
              inputProps={{ step: '0.01' }}
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
            />
            <TextField
              label={t('billing.reviewDialog.fields.readAt')}
              type="datetime-local"
              value={prevReadAt}
              onChange={(event) => setPrevReadAt(event.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
            />
          </Stack>

          <Typography variant="subtitle2">{t('billing.reviewDialog.currentReading')}</Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label={t('billing.reviewDialog.fields.value')}
              type="number"
              value={currentValue}
              onChange={(event) => setCurrentValue(event.target.value)}
              inputProps={{ step: '0.01' }}
              slotProps={{ inputLabel: { shrink: true } }}
              error={Boolean(consumptionError)}
              helperText={consumptionError || t('billing.reviewDialog.helpers.consumptionMin')}
              fullWidth
            />
            <TextField
              label={t('billing.reviewDialog.fields.readAt')}
              type="datetime-local"
              value={currentReadAt}
              onChange={(event) => setCurrentReadAt(event.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              error={Boolean(currentReadAtError)}
              helperText={currentReadAtError || t('billing.reviewDialog.helpers.readAt')}
              fullWidth
            />
          </Stack>

          <TextField
            label={t('billing.reviewDialog.fields.editReason')}
            value={editReason}
            onChange={(event) => setEditReason(event.target.value)}
            error={Boolean(editReasonError)}
            helperText={editReasonError || t('validation.required')}
            multiline
            minRows={2}
            fullWidth
          />
          {isShared && (
            <TextField
              label={t('billing.reviewDialog.fields.householdSize')}
              type="number"
              value={householdSize}
              onChange={(event) => setHouseholdSize(event.target.value)}
              error={Boolean(householdSizeError)}
              helperText={householdSizeError || t('billing.reviewDialog.helpers.householdSizeMin')}
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
        <Button onClick={onClose} disabled={reviewSaving}>
          {t('billing.reviewDialog.actions.cancel')}
        </Button>
        <Button variant="contained" onClick={handleSaveReview} disabled={reviewSaving}>
          {t('billing.reviewDialog.actions.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
