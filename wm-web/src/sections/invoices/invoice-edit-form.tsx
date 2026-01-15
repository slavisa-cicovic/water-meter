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
            <Card>
              <CardHeader title={t('billing.invoice.summary')} />
              <CardContent>
                <Stack spacing={1} sx={{ display: 'grid', gridTemplateColumns: '1fr auto', columnGap: 2, rowGap: 1 }}>
                  <Typography variant="body2">{t('billing.invoice.account')}</Typography>
                  <Typography variant="body2" textAlign="right">
                    {invoice.account ? `${invoice.account.firstName} ${invoice.account.lastName}` : invoice.accountId}
                  </Typography>
                  <Typography variant="body2">{t('billing.invoice.status')}</Typography>
                  <Typography variant="body2" textAlign="right">
                    {statusLabel}
                  </Typography>
                  <Typography variant="body2">{t('billing.invoice.meter')}</Typography>
                  <Typography variant="body2" textAlign="right">
                    {invoice.meter?.serialNumber || invoice.meterId || '-'}
                  </Typography>
                  <Typography variant="body2">
                    {t('billing.invoice.previousReading')}{' '}
                    {invoice.periodStart?.slice(0, 10) || ''}
                  </Typography>
                  <Typography variant="body2" textAlign="right">
                    {readings[0]?.role === 'start' ? readings[0]?.value : '-'}
                  </Typography>
                  <Typography variant="body2">
                    {t('billing.invoice.currentReading')}{' '}
                    {invoice.periodEnd?.slice(0, 10) || ''}
                  </Typography>
                  <Typography variant="body2" textAlign="right">
                    {readings[0]?.role === 'end'
                      ? readings[0]?.value
                      : readings.find((reading: any) => reading.role === 'end')?.value || '-'}
                  </Typography>
                  <Typography variant="body2">{t('billing.invoice.consumption')}</Typography>
                  <Typography variant="body2" textAlign="right">
                    {invoice.consumption}
                  </Typography>
                  <Typography variant="body2">{t('billing.invoice.subtotal')}</Typography>
                  <Typography variant="body2" textAlign="right">
                    {formatCurrencyValue(invoice.subtotal, currency)}
                  </Typography>
                  <Typography variant="body2">{t('billing.invoice.vat')}</Typography>
                  <Typography variant="body2" textAlign="right">
                    {formatCurrencyValue(invoice.vatAmount, currency)}
                  </Typography>
                  <Typography variant="body2">{t('billing.invoice.total')}</Typography>
                  <Typography variant="body2" textAlign="right">
                    {formatCurrencyValue(invoice.totalAmount, currency)}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="flex-end" sx={{ mt: 3 }}>
                  <Button variant="outlined" color="error" onClick={() => setCancelOpen(true)} disabled={!canEdit}>
                    {t('billing.actions.cancel')}
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardHeader title={t('billing.invoice.lineItems')} />
              <CardContent>
                {!canEdit && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    {t('billing.invoice.readOnly')}
                  </Alert>
                )}
                <TableContainer>
                  <Table size="small">
                    <TableHeadCustom
                      order="asc"
                      orderBy="label"
                      headLabel={[
                        { id: 'selected', label: '', width: 48, disableSort: true },
                        { id: 'label', label: t('billing.lineItems.table.name'), minWidth: 200, disableSort: true },
                        { id: 'quantity', label: t('billing.invoice.consumption'), width: 140, disableSort: true },
                        { id: 'unit', label: t('billing.invoice.unitPrice'), width: 160, disableSort: true },
                        { id: 'amount', label: t('billing.invoice.total'), width: 160, disableSort: true },
                      ]}
                    />
                    <TableBody>
                      <TableRow hover>
                        <TableCell padding="checkbox">
                          <Checkbox checked disabled />
                        </TableCell>
                        <TableCell sx={{ minWidth: 200 }}>{t('billing.invoice.consumption')}</TableCell>
                        <TableCell sx={{ width: 140 }}>{invoice.consumption}</TableCell>
                        <TableCell sx={{ width: 160 }}>
                          {formatCurrencyValue(invoice.unitPrice, currency)}
                        </TableCell>
                        <TableCell sx={{ width: 160 }}>
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
                              <TableCell padding="checkbox">
                                <Checkbox
                                  checked={!!isChecked}
                                  onChange={() => handleToggleLineItem(item.id)}
                                  disabled={!canEdit || saving}
                                />
                              </TableCell>
                              <TableCell sx={{ minWidth: 200 }}>{item.description || item.name}</TableCell>
                              <TableCell sx={{ width: 140 }}>-</TableCell>
                              <TableCell sx={{ width: 160 }}>{valueLabel}</TableCell>
                              <TableCell sx={{ width: 160 }}>{lineAmount}</TableCell>
                            </TableRow>
                          );
                        })}
                      <TableNoData notFound={!lineItems.length} />
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
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
