import { yupResolver } from '@hookform/resolvers/yup';
import {
  Alert,
  Button,
  Checkbox,
  Box,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { useEffect, useMemo, useState } from 'react';
import { BillingApi, useGetInvoiceLineItems } from 'src/api/billing';
import { useGetSettings } from 'src/api/settings';
import { TableHeadCustom, TableNoData } from 'src/components/table';
import { Invoice } from 'src/types/billings';
import { formatCurrencyValue } from 'src/utils/format-currency';
import { formatReadingValue } from 'src/utils/reading-format';
import { useLocales } from 'src/locales';
import { ConfirmDialog } from 'src/components/custom-dialog';
import Logo from 'src/components/logo';

type Props = {
  invoice: Invoice;
  currency?: string | null;
  onUpdated?: VoidFunction;
};

type FormValues = {
  lineItemIds: string[];
};

type SummaryRow = {
  id: string;
  sortOrder: number;
  label: string;
  detail?: string | number;
  unit?: string;
  amount?: string | number;
  hover?: boolean;
} & (
    | { checkbox: 'none' }
    | { checkbox: 'locked' }
    | {
      checkbox: 'toggle';
      checked: boolean;
      disabled: boolean;
      onToggle: () => void;
    }
  );

export function InvoiceEditForm({ invoice, currency, onUpdated }: Props) {
  const { t } = useLocales();
  const { settings: appSettings } = useGetSettings();
  const { lineItems } = useGetInvoiceLineItems();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [issueOpen, setIssueOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const canEdit = ['draft', 'issued'].includes(invoice.status);
  const canIssue = invoice.status === 'draft';
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

  const handleIssueInvoice = async () => {
    await BillingApi.issueInvoices([invoice.id]);
    setIssueOpen(false);
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

  const summaryRows: SummaryRow[] = [
    {
      id: 'account',
      sortOrder: -700,
      checkbox: 'none' as const,
      label: t('billing.invoice.account'),
      amount: invoice.account ? `${invoice.account.firstName} ${invoice.account.lastName}` : invoice.accountId,
    },
    {
      id: 'address',
      sortOrder: -650,
      checkbox: 'none' as const,
      label: t('billing.invoice.address'),
      amount: invoice.account?.address || '-',
    },
    {
      id: 'status',
      sortOrder: -600,
      checkbox: 'none' as const,
      label: t('billing.invoice.status'),
      amount: statusLabel,
    },
    {
      id: 'meter',
      sortOrder: -550,
      checkbox: 'none' as const,
      label: t('billing.invoice.meter'),
      amount: invoice.meter?.serialNumber || invoice.meterId || '-',
    },
    {
      id: 'previous-reading',
      sortOrder: -500,
      checkbox: 'none' as const,
      label: t('billing.invoice.previousReading'),
      detail: invoice.periodStart?.slice(0, 10) || '',
      amount: readings[0]?.role === 'start' ? readings[0]?.value : '-',
    },
    {
      id: 'current-reading',
      sortOrder: -450,
      checkbox: 'none' as const,
      label: t('billing.invoice.currentReading'),
      detail: invoice.periodEnd?.slice(0, 10) || '',
      amount:
        readings[0]?.role === 'end'
          ? readings[0]?.value
          : readings.find((reading: any) => reading.role === 'end')?.value || '-',
    },
    {
      id: 'consumption',
      sortOrder: -100,
      checkbox: 'none' as const,
      label: t('billing.invoice.consumption'),
      detail: invoice.consumption,
      unit: formatCurrencyValue(invoice.unitPrice, currency),
      amount: formatCurrencyValue(invoice.subtotal, currency),
      hover: true,
    },
    ...lineItems.map<SummaryRow>((item) => {
      const valueLabel = item.isPercentage
        ? `${item.value}%`
        : formatCurrencyValue(item.value, currency);
      const lineAmount = item.isPercentage
        ? formatCurrencyValue(
          Number(invoice.subtotal) * (Number(item.value) / 100),
          currency
        )
        : formatCurrencyValue(item.value, currency);
      return {
        id: item.id,
        sortOrder: item.sortOrder ?? 0,
        checkbox: 'toggle',
        label: item.description || item.name,
        detail: '-',
        unit: valueLabel,
        amount: lineAmount,
        checked: selectedLineItemIds?.includes(item.id) ?? false,
        disabled: !canEdit || saving,
        hover: true,
        onToggle: () => {
          void handleToggleLineItem(item.id);
        },
      };
    }),
  ]
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const companyLogoUrl = appSettings?.companyLogoUrl?.trim() || "";
  const companyName = appSettings?.companyName?.trim() || "Vodoprivredno preduzece";
  const companyAddress = appSettings?.companyAddress?.trim() || "";
  const companyZip = appSettings?.companyZip?.trim() || "";
  const companyCity = appSettings?.companyCity?.trim() || "";
  const companyRegistrationNumber = appSettings?.companyRegistrationNumber?.trim() || "";
  const companyCompanyNumber = appSettings?.companyCompanyNumber?.trim() || "";
  const companyTaxId = appSettings?.companyTaxId?.trim() || "";
  const companyLocation =
    companyZip || companyCity ? `${companyZip}${companyZip && companyCity ? " " : ""}${companyCity}` : "";

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
            <Table size="small" >
              <TableHead>
                <TableRow>
                  <TableCell colSpan={5} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Box display="grid" gridTemplateColumns={{ xs: "1fr", md: "64px 1fr auto" }} columnGap={2}>
                      <Box>
                        {companyLogoUrl ? (
                          <Box
                            component="img"
                            src={companyLogoUrl}
                            alt={companyName}
                            sx={{ width: 56, height: 56, objectFit: "contain" }}
                          />
                        ) : (
                          <Logo disabledLink sx={{ width: 56, height: 56 }} />
                        )}
                      </Box>
                      <Box>
                        <Typography variant="h6">{companyName}</Typography>
                        {companyLocation || companyAddress ? (
                          <Typography variant="body2" color="text.secondary">
                            {[companyLocation, companyAddress].filter(Boolean).join(", ")}
                          </Typography>
                        ) : null}
                      </Box>
                      <Stack spacing={0.5} alignItems={{ xs: "flex-start", md: "flex-end" }}>
                        {companyRegistrationNumber && (
                          <Typography variant="body2">
                            {t("settings.company.registrationNumber")}: {companyRegistrationNumber}
                          </Typography>
                        )}
                        {companyCompanyNumber && (
                          <Typography variant="body2">
                            {t("settings.company.companyNumber")}: {companyCompanyNumber}
                          </Typography>
                        )}
                        {companyTaxId && (
                          <Typography variant="body2">
                            {t("settings.company.taxId")}: {companyTaxId}
                          </Typography>
                        )}
                      </Stack>
                    </Box>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                {summaryRows.map((row) => (
                  <TableRow key={row.id} hover={row.hover}>
                    <TableCell padding="checkbox" sx={{ width: tableColumnWidths.checkbox }}>
                      {row.checkbox === 'locked' && <Checkbox checked disabled />}
                      {row.checkbox === 'toggle' && (
                        <Checkbox checked={!!row.checked} onChange={row.onToggle} disabled={row.disabled} />
                      )}
                    </TableCell>
                    <TableCell sx={{ width: tableColumnWidths.label }}>{row.label}</TableCell>
                    <TableCell sx={{ width: tableColumnWidths.detail }}>{row.detail ?? ''}</TableCell>
                    <TableCell sx={{ width: tableColumnWidths.unit, whiteSpace: 'nowrap' }}>
                      {row.unit ?? ''}
                    </TableCell>
                    <TableCell
                      sx={{ width: tableColumnWidths.amount, whiteSpace: 'nowrap' }}
                      align="right"
                    >
                      {row.amount ?? ''}
                    </TableCell>
                  </TableRow>
                ))}
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
                    <Typography variant="h6" fontWeight={700}>
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
                    <Typography variant="h6" fontWeight={700}>
                      {formatCurrencyValue(invoice.totalAmount, currency)}
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </TableContainer>
          {canEdit && (
            <Stack direction="row" justifyContent="flex-end" sx={{ mt: 3 }} spacing={1}>
              {canIssue && (
                <Button variant="contained" onClick={() => setIssueOpen(true)}>
                  {t('billing.actions.issue')}
                </Button>
              )}
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
      <ConfirmDialog
        open={issueOpen}
        onClose={() => setIssueOpen(false)}
        title={t('billing.issue.title')}
        content={t('billing.issue.body')}
        action={
          <Button variant="contained" onClick={handleIssueInvoice}>
            {t('billing.actions.issue')}
          </Button>
        }
      />
    </Stack>
  );
}
