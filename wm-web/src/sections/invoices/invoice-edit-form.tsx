import { yupResolver } from '@hookform/resolvers/yup';
import {
  Alert,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableRow,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { useEffect, useMemo, useState } from 'react';
import { BillingApi, useGetInvoiceLineItems } from 'src/api/billing';
import { TableHeadCustom, TableNoData } from 'src/components/table';
import { Invoice } from 'src/types/billings';
import { formatCurrencyValue } from 'src/utils/format-currency';
import { formatReadingValue } from 'src/utils/reading-format';
import { useLocales } from 'src/locales';
import { ConfirmDialog } from 'src/components/custom-dialog';

type Props = {
  invoice: Invoice;
  currency?: string | null;
  onUpdated?: VoidFunction;
};

type FormValues = {
  lineItemIds: string[];
};

export function InvoiceEditForm({ invoice, currency, onUpdated }: Props) {
  const { t } = useLocales();
  const { lineItems } = useGetInvoiceLineItems();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const canEdit = ['draft', 'issued'].includes(invoice.status);
  const tableColumnWidths = {
    checkbox: 40,
    label: '35%',
    detail: 120,
    unit: 90,
    amount: 220,
  } as const;

  const lineItemIds = useMemo(
    () => lineItems.slice().sort((a, b) => a.sortOrder - b.sortOrder).map((item) => item.id),
    [lineItems]
  );

  const schema = Yup.object().shape({
    lineItemIds: Yup.array().of(Yup.string().required()).required(),
  });

  const methods = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: { lineItemIds },
    mode: 'onChange',
  });

  const { reset, watch, setValue } = methods;

  useEffect(() => {
    if (lineItemIds.length) {
      reset({ lineItemIds });
    }
  }, [lineItemIds, reset]);

  const readings = useMemo(() => {
    const links = (invoice as any)?.readings || [];
    return links.map((link: any) => ({
      role: link.role,
      value: link.reading?.value,
      readAt: link.reading?.readAt,
    }));
  }, [invoice]);

  const statusLabel = t(`billing.status.${invoice.status}`, { defaultValue: invoice.status });

  const handleCancelInvoice = async () => {
    await BillingApi.cancelInvoices([invoice.id]);
    setCancelOpen(false);
    await onUpdated?.();
  };

  const selectedLineItemIds = watch('lineItemIds');

  const handleToggleLineItem = async (id: string) => {
    if (!canEdit || saving) return;
    const current = new Set(selectedLineItemIds || []);
    if (current.has(id)) {
      current.delete(id);
    } else {
      current.add(id);
    }
    const nextIds = Array.from(current);
    setValue('lineItemIds', nextIds, { shouldDirty: true, shouldValidate: true });
    setSaving(true);
    try {
      await BillingApi.updateInvoiceLineItems(invoice.id, nextIds);
      await onUpdated?.();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Stack spacing={3}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          {!canEdit && (
            <Alert severity="info" sx={{ mb: 2 }}>
              {t('billing.invoice.readOnly')}
            </Alert>
          )}
          <TableContainer>
            <Table size="small" sx={{ tableLayout: 'fixed' }}>
              <TableBody
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <TableRow>
                  <TableCell padding="checkbox" sx={{ width: tableColumnWidths.checkbox }} />
                  <TableCell sx={{ width: tableColumnWidths.label }}>
                    {t('billing.invoice.account')}
                  </TableCell>
                  <TableCell sx={{ width: tableColumnWidths.detail }} />
                  <TableCell sx={{ width: tableColumnWidths.unit }} />
                  <TableCell
                    sx={{ width: tableColumnWidths.amount, whiteSpace: 'nowrap' }}
                    align="right"
                  >
                    {invoice.account ? `${invoice.account.firstName} ${invoice.account.lastName}` : invoice.accountId}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell padding="checkbox" sx={{ width: tableColumnWidths.checkbox }} />
                  <TableCell sx={{ width: tableColumnWidths.label }}>
                    {t('billing.invoice.address')}
                  </TableCell>
                  <TableCell sx={{ width: tableColumnWidths.detail }} />
                  <TableCell sx={{ width: tableColumnWidths.unit }} />
                  <TableCell
                    sx={{ width: tableColumnWidths.amount, whiteSpace: 'nowrap' }}
                    align="right"
                  >
                    {invoice.account?.address || '-'}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell padding="checkbox" sx={{ width: tableColumnWidths.checkbox }} />
                  <TableCell sx={{ width: tableColumnWidths.label }}>
                    {t('billing.invoice.status')}
                  </TableCell>
                  <TableCell sx={{ width: tableColumnWidths.detail }} />
                  <TableCell sx={{ width: tableColumnWidths.unit }} />
                  <TableCell
                    sx={{ width: tableColumnWidths.amount, whiteSpace: 'nowrap' }}
                    align="right"
                  >
                    {statusLabel}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell padding="checkbox" sx={{ width: tableColumnWidths.checkbox }} />
                  <TableCell sx={{ width: tableColumnWidths.label }}>
                    {t('billing.invoice.meter')}
                  </TableCell>
                  <TableCell sx={{ width: tableColumnWidths.detail }} />
                  <TableCell sx={{ width: tableColumnWidths.unit }} />
                  <TableCell
                    sx={{ width: tableColumnWidths.amount, whiteSpace: 'nowrap' }}
                    align="right"
                  >
                    {invoice.meter?.serialNumber || invoice.meterId || '-'}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell padding="checkbox" sx={{ width: tableColumnWidths.checkbox }} />
                  <TableCell sx={{ width: tableColumnWidths.label }}>
                    {t('billing.invoice.previousReading')}
                  </TableCell>
                  <TableCell sx={{ width: tableColumnWidths.detail }}>
                    {invoice.periodStart?.slice(0, 10) || ''}
                  </TableCell>
                  <TableCell sx={{ width: tableColumnWidths.unit }} />
                  <TableCell
                    sx={{ width: tableColumnWidths.amount, whiteSpace: 'nowrap' }}
                    align="right"
                  >
                    {readings[0]?.role === 'start' ? readings[0]?.value : '-'}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell padding="checkbox" sx={{ width: tableColumnWidths.checkbox }} />
                  <TableCell sx={{ width: tableColumnWidths.label }}>
                    {t('billing.invoice.currentReading')}
                  </TableCell>
                  <TableCell sx={{ width: tableColumnWidths.detail }}>
                    {invoice.periodEnd?.slice(0, 10) || ''}
                  </TableCell>
                  <TableCell sx={{ width: tableColumnWidths.unit }} />
                  <TableCell
                    sx={{ width: tableColumnWidths.amount, whiteSpace: 'nowrap' }}
                    align="right"
                  >
                    {readings[0]?.role === 'end'
                      ? readings[0]?.value
                      : readings.find((reading: any) => reading.role === 'end')?.value || '-'}
                  </TableCell>
                </TableRow>
                <TableRow hover>
                  <TableCell padding="checkbox" sx={{ width: tableColumnWidths.checkbox }}>
                    <Checkbox checked disabled />
                  </TableCell>
                  <TableCell sx={{ width: tableColumnWidths.label }}>
                    {t('billing.invoice.consumption')}
                  </TableCell>
                  <TableCell sx={{ width: tableColumnWidths.detail, whiteSpace: 'nowrap' }}>
                    {invoice.consumption}
                  </TableCell>
                  <TableCell sx={{ width: tableColumnWidths.unit, whiteSpace: 'nowrap' }}>
                    {formatCurrencyValue(invoice.unitPrice, currency)}
                  </TableCell>
                  <TableCell
                    sx={{ width: tableColumnWidths.amount, whiteSpace: 'nowrap' }}
                    align="right"
                  >
                    {formatCurrencyValue(invoice.subtotal, currency)}
                  </TableCell>
                </TableRow>
                {lineItems
                  .slice()
                  .sort((a, b) => a.sortOrder - b.sortOrder)
                  .map((item) => {
                    const isChecked = selectedLineItemIds?.includes(item.id);
                    const valueLabel = item.isPercentage
                      ? `${item.value}%`
                      : formatCurrencyValue(item.value, currency);
                    const lineAmount = item.isPercentage
                      ? formatCurrencyValue(
                        Number(invoice.subtotal) * (Number(item.value) / 100),
                        currency
                      )
                      : formatCurrencyValue(item.value, currency);
                    return (
                      <TableRow key={item.id} hover>
                        <TableCell padding="checkbox" sx={{ width: tableColumnWidths.checkbox }}>
                          <Checkbox
                            checked={!!isChecked}
                            onChange={() => handleToggleLineItem(item.id)}
                            disabled={!canEdit || saving}
                          />
                        </TableCell>
                        <TableCell sx={{ width: tableColumnWidths.label }}>
                          {item.description || item.name}
                        </TableCell>
                        <TableCell sx={{ width: tableColumnWidths.detail }}>-</TableCell>
                        <TableCell sx={{ width: tableColumnWidths.unit, whiteSpace: 'nowrap' }}>
                          {valueLabel}
                        </TableCell>
                        <TableCell
                          sx={{ width: tableColumnWidths.amount, whiteSpace: 'nowrap' }}
                          align="right"
                        >
                          {lineAmount}
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
              <TableFooter
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <TableRow>
                  <TableCell padding="checkbox" sx={{ width: tableColumnWidths.checkbox }} />
                  <TableCell sx={{ width: tableColumnWidths.label, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="body2" fontWeight={700}>
                      {t('billing.invoice.total')}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ width: tableColumnWidths.detail, pt: 2, borderTop: '1px solid', borderColor: 'divider' }} />
                  <TableCell sx={{ width: tableColumnWidths.unit, pt: 2, borderTop: '1px solid', borderColor: 'divider' }} />
                  <TableCell
                    sx={{
                      width: tableColumnWidths.amount,
                      whiteSpace: 'nowrap',
                      pt: 2,
                      borderTop: '1px solid',
                      borderColor: 'divider',
                    }}
                    align="right"
                  >
                    <Typography variant="body2" fontWeight={700}>
                      {formatCurrencyValue(invoice.totalAmount, currency)}
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </TableContainer>
          {canEdit && (
            <Stack direction="row" justifyContent="flex-end" sx={{ mt: 3 }}>
              <Button variant="outlined" color="error" onClick={() => setCancelOpen(true)}>
                {t('billing.actions.cancel')}
              </Button>
            </Stack>
          )}
        </Grid>
      </Grid>

      <ConfirmDialog
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        title={t('billing.cancel.title')}
        content={t('billing.cancel.body', { count: 1 })}
        action={
          <Button variant="contained" color="error" onClick={handleCancelInvoice}>
            {t('billing.actions.cancel')}
          </Button>
        }
      />
    </Stack>
  );
}
