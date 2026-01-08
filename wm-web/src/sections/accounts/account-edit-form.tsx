import { yupResolver } from '@hookform/resolvers/yup';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';
import { format } from 'date-fns';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid2';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import Tooltip from '@mui/material/Tooltip';
// routes
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { formatReadingValue, roundReadingValue } from 'src/utils/reading-format';
import { formatCurrencyValue } from 'src/utils/format-currency';
// locales
import { useLocales } from 'src/locales';
// hooks
import { useResponsive } from 'src/hooks/use-responsive';
// api
import { BillingApi, useGetInvoices, useGetTariffs } from 'src/api/billing';
import { ReadingsApi, useGetReadings } from 'src/api/readings';
import { AccountsApi } from 'src/api/accounts';
import { useGetSettings } from 'src/api/settings';
// auth
import { useAuthContext } from 'src/auth/hooks';
import { PERMISSIONS } from 'src/constants/permissions';
// components
import FormProvider, { RHFTextField } from 'src/components/hook-form';
import { ChartWrapper, useChart } from 'src/components/chart';
// types
import { AccountRow } from 'src/types/accounts';
import { Invoice, InvoiceStatus } from 'src/types/billings';
import { Reading } from 'src/types/readings';
import { ReadingsReviewDialog } from 'src/components/billing/readings-review-dialog';
import { ConfirmDialog } from 'src/components/custom-dialog';
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
  currentAccount?: AccountRow;
};

export default function AccountEditForm({ currentAccount }: Props) {
  const { t } = useLocales();
  const router = useRouter();
  const mdUp = useResponsive('up', 'md');
  const { user } = useAuthContext();
  const { tariffs, tariffsLoading } = useGetTariffs();
  const { settings: appSettings } = useGetSettings();

  const AccountSchema = Yup.object().shape({
    firstName: Yup.string().required(t('validation.required')),
    lastName: Yup.string().required(t('validation.required')),
    address: Yup.string().required(t('validation.required')),
    tariffId: Yup.string().nullable(),
  });

  const defaultValues = useMemo(
    () => ({
      id: currentAccount?.id,
      firstName: currentAccount?.data.firstName || '',
      lastName: currentAccount?.data.lastName || '',
      address: currentAccount?.data.address || '',
      email: currentAccount?.data.email || '',
      tariffId: currentAccount?.data.tariffId || '',
    }),
    [currentAccount]
  );

  const methods = useForm({
    resolver: yupResolver(AccountSchema),
    defaultValues,
    mode: 'onChange',
  });

  const {
    watch,
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  const [addressPromptOpen, setAddressPromptOpen] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState<any>(null);

  const viewerRole = (user as any)?.role as string | undefined;
  const viewerId = (user as any)?.accountId || (user as any)?.id;
  const currentPermissions = (user as any)?.permissions as string[] | undefined;
  const hasPermission = (permission: string) => currentPermissions?.includes(permission) ?? false;
  const canEditReadings = hasPermission(PERMISSIONS.READINGS_UPDATE);
  const canEdit = hasPermission(PERMISSIONS.ACCOUNTS_UPDATE);

  useEffect(() => {
    if (currentAccount) {
      reset(defaultValues);
    }
  }, [currentAccount, defaultValues, reset]);

  const applySubmit = async (data: any, updateMeterAddress: boolean) => {
    try {
      if (!currentAccount?.id) return;
      const payload = {
        firstName: data.firstName?.trim?.() ?? data.firstName,
        lastName: data.lastName?.trim?.() ?? data.lastName,
        address: data.address?.trim?.() ?? data.address,
        tariffId: currentAccount?.type === 'consumer' ? (data.tariffId ? data.tariffId : null) : undefined,
        updateMeterAddress,
      };

      await AccountsApi.updateAccount(currentAccount.id, payload);
      reset(data);
      router.push(paths.dashboard.accounts.root);
    } catch (error) {
      console.error(error);
    }
  };

  const onSubmit = async (data: any) => {
    if (!canEdit) return;
    const addressChanged = currentAccount?.data.address !== data.address;
    if (addressChanged) {
      setPendingSubmit(data);
      setAddressPromptOpen(true);
      return;
    }
    await applySubmit(data, false);
  };

  const handleAddressDecision = async (updateMeterAddress: boolean) => {
    setAddressPromptOpen(false);
    if (pendingSubmit) {
      await applySubmit(pendingSubmit, updateMeterAddress);
      setPendingSubmit(null);
    }
  };

  const accountId = currentAccount?.id;
  const isConsumer = currentAccount?.type === 'consumer';
  const isStaffField = currentAccount?.type === 'staff_field';

  const billingStatusOptions = useMemo<Array<{ label: string; value: InvoiceStatus }>>(
    () => [
      { label: t('accounts.billing.status.draft'), value: 'draft' },
      { label: t('accounts.billing.status.confirmed'), value: 'confirmed' },
      { label: t('accounts.billing.status.issued'), value: 'issued' },
      { label: t('accounts.billing.status.paid'), value: 'paid' },
      { label: t('accounts.billing.status.void'), value: 'void' },
    ],
    [t]
  );

  const currentYear = new Date().getFullYear();
  const [billingFrom, setBillingFrom] = useState(`${currentYear}-01-01`);
  const [billingTo, setBillingTo] = useState(`${currentYear}-12-31`);
  const [billingStatus, setBillingStatus] = useState<'' | InvoiceStatus>('');
  const [billingTab, setBillingTab] = useState<'chart' | 'table'>('chart');
  const [readingFrom, setReadingFrom] = useState(`${currentYear}-01-01`);
  const [readingTo, setReadingTo] = useState(`${currentYear}-12-31`);
  const [readingsTab, setReadingsTab] = useState<'chart' | 'table'>('chart');
  const [selectedMeterId, setSelectedMeterId] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [editReason, setEditReason] = useState('');
  const [editError, setEditError] = useState('');
  const [editReasonError, setEditReasonError] = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const [editBounds, setEditBounds] = useState<{ min?: number; max?: number } | null>(null);
  const [editingReading, setEditingReading] = useState<Reading | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewInvoice, setReviewInvoice] = useState<Invoice | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmInvoice, setConfirmInvoice] = useState<Invoice | null>(null);
  const { invoices, invoicesLoading, mutate: mutateInvoices } = useGetInvoices(
    isConsumer && accountId
      ? {
          accountId,
          createdStart: billingFrom || undefined,
          createdEnd: billingTo || undefined,
          status: billingStatus || undefined,
          orderBy: 'createdAt',
          order: 'desc',
        }
      : undefined
  );
  const { readings, readingsLoading, readingsEmpty, mutate: mutateReadings } = useGetReadings(
    isStaffField && accountId
      ? { accountId, from: readingFrom || undefined, to: readingTo || undefined }
      : undefined
  );

  const meterOptions = useMemo(() => {
    const options = new Map<
      string,
      { id: string; groupCode?: string; address?: string; serialNumber?: string }
    >();

    readings.forEach((reading) => {
      if (!options.has(reading.meterId)) {
        options.set(reading.meterId, {
          id: reading.meterId,
          groupCode: reading.meter?.groupCode,
          address: reading.meter?.address,
          serialNumber: reading.meter?.serialNumber,
        });
      }
    });

    return Array.from(options.values());
  }, [readings]);

  useEffect(() => {
    if (!meterOptions.length) {
      if (selectedMeterId) setSelectedMeterId('');
      return;
    }

    const hasSelected = meterOptions.some((meter) => meter.id === selectedMeterId);
    if (!selectedMeterId || !hasSelected) {
      setSelectedMeterId(meterOptions[0].id);
    }
  }, [meterOptions, selectedMeterId]);

  const filteredReadings = useMemo(() => {
    if (!selectedMeterId) return readings;
    return readings.filter((reading) => reading.meterId === selectedMeterId);
  }, [readings, selectedMeterId]);

  const formatMeterLabel = (meter: { groupCode?: string; address?: string; serialNumber?: string }) => {
    const groupCode = meter.groupCode || '-';
    const address = meter.address || '-';
    const serialNumber = meter.serialNumber || '-';
    return t('accounts.readings.meterLabel', { group: groupCode, address, serial: serialNumber });
  };

  const readingsChartData = useMemo(() => {
    if (!filteredReadings?.length) return { categories: [] as string[], data: [] as number[] };

    const totals = new Map<number, { label: string; total: number }>();

    filteredReadings.forEach((reading, index) => {
      const prev = filteredReadings[index + 1];
      if (!prev) return;

      const consumption = reading.value - prev.value;
      const readDate = new Date(reading.readAt);

      if (!Number.isFinite(consumption) || Number.isNaN(readDate.getTime())) {
        return;
      }

      const bucket = new Date(readDate.getFullYear(), readDate.getMonth(), 1).getTime();
      const label = format(readDate, 'MMM yyyy');
      const current = totals.get(bucket);

      totals.set(bucket, { label, total: (current?.total || 0) + consumption });
    });

    const sorted = Array.from(totals.entries()).sort((a, b) => a[0] - b[0]);

    return {
      categories: sorted.map(([, value]) => value.label),
      data: sorted.map(([, value]) => value.total),
    };
  }, [filteredReadings]);

  const chartOptions = useChart(
    useMemo(
      () => ({
        xaxis: { categories: readingsChartData.categories },
        tooltip: {
          y: {
            formatter: (value: number) => `${value}`,
            title: { formatter: () => t('accounts.readings.chart.consumption') },
          },
        },
      }),
      [readingsChartData.categories, t]
    )
  );

  const chartSeries = useMemo(
    () => [{ name: t('accounts.readings.chart.consumption'), data: readingsChartData.data }],
    [readingsChartData.data, t]
  );

  const hasChartData = readingsChartData.data.length > 0;
  const readingsFilteredEmpty = !readingsLoading && filteredReadings.length === 0;

  const renderReadingsContent = (content: ReactNode) => {
    if (readingsLoading) return <Typography variant="body2">{t('accounts.readings.loading')}</Typography>;
    if (readingsEmpty || readingsFilteredEmpty)
      return <Typography variant="body2">{t('accounts.readings.empty')}</Typography>;
    return content;
  };

  const billingBuckets = useMemo(() => {
    const parsedFrom = new Date(billingFrom);
    const baseYear = Number.isNaN(parsedFrom.getTime()) ? new Date().getFullYear() : parsedFrom.getFullYear();
    const buckets = Array.from({ length: 12 }, (_, month) => {
      const bucketDate = new Date(baseYear, month, 1);
      return {
        key: `${baseYear}-${month}`,
        label: format(bucketDate, 'MMM yyyy'),
        total: 0,
        flags: new Set<string>(),
        latestInvoice: null as Invoice | null,
        latestCreatedAt: 0,
      };
    });

    const byKey = new Map(buckets.map((bucket) => [bucket.key, bucket]));

    invoices.forEach((invoice) => {
      if (!invoice.createdAt) return;
      const createdAt = new Date(invoice.createdAt);
      if (Number.isNaN(createdAt.getTime())) return;
      if (createdAt.getFullYear() !== baseYear) return;
      const amount = Number(invoice.totalAmount);
      if (!Number.isFinite(amount)) return;

      const key = `${createdAt.getFullYear()}-${createdAt.getMonth()}`;
      const bucket = byKey.get(key);
      if (!bucket) return;

      bucket.total += amount;
      if (invoice.reviewFlags?.length) {
        invoice.reviewFlags.forEach((flag) => bucket.flags.add(flag));
      }
      if (createdAt.getTime() >= bucket.latestCreatedAt) {
        bucket.latestCreatedAt = createdAt.getTime();
        bucket.latestInvoice = invoice;
      }
    });

    return buckets;
  }, [billingFrom, invoices]);

  const billingChartData = useMemo(
    () => ({
      categories: billingBuckets.map((bucket) => bucket.label),
      data: billingBuckets.map((bucket) => bucket.total),
    }),
    [billingBuckets]
  );

  const billingChartOptions = useChart(
    useMemo(
      () => ({
        xaxis: { categories: billingChartData.categories },
        tooltip: {
          y: {
            formatter: (value: number) => formatCurrencyValue(value, appSettings?.currency),
            title: { formatter: () => t('accounts.billing.chart.total') },
          },
        },
      }),
      [appSettings?.currency, billingChartData.categories, t]
    )
  );

  const billingChartSeries = useMemo(
    () => [{ name: t('accounts.billing.chart.totalBilled'), data: billingChartData.data }],
    [billingChartData.data, t]
  );

  const renderBillingContent = (content: ReactNode) => {
    if (invoicesLoading) return <Typography variant="body2">{t('accounts.billing.loading')}</Typography>;
    return content;
  };

  const getInvoiceStatusColor = (status: InvoiceStatus) => {
    if (status === 'paid') return 'success';
    if (status === 'confirmed') return 'secondary';
    if (status === 'issued') return 'info';
    if (status === 'void') return 'default';
    return 'warning';
  };

  const effectiveDate = useMemo(() => {
    const now = new Date();
    if (appSettings?.currentDateMode !== 'manual' || !appSettings.currentDateValue) return now;
    const parsed = new Date(`${appSettings.currentDateValue}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) return now;
    return new Date(
      parsed.getFullYear(),
      parsed.getMonth(),
      parsed.getDate(),
      now.getHours(),
      now.getMinutes(),
      now.getSeconds(),
      now.getMilliseconds()
    );
  }, [appSettings?.currentDateMode, appSettings?.currentDateValue]);
  const currentMonthKey = `${effectiveDate.getFullYear()}-${effectiveDate.getMonth()}`;

  const handleOpenReviewDialog = (invoice: Invoice) => {
    setReviewInvoice(invoice);
    setReviewDialogOpen(true);
  };

  const handleCloseReviewDialog = () => {
    setReviewDialogOpen(false);
    setReviewInvoice(null);
  };

  const handleOpenConfirmDialog = (invoice: Invoice) => {
    setConfirmInvoice(invoice);
    setConfirmDialogOpen(true);
  };

  const handleCloseConfirmDialog = () => {
    setConfirmDialogOpen(false);
    setConfirmInvoice(null);
  };

  const handleConfirmInvoice = async () => {
    if (!confirmInvoice) return;
    try {
      await BillingApi.confirmInvoices([confirmInvoice.id]);
      await mutateInvoices();
      handleCloseConfirmDialog();
    } catch (error) {
      console.error(error);
    }
  };

  const handleOpenEditDialog = (reading: Reading, index: number) => {
    const prev = filteredReadings[index + 1];
    const next = filteredReadings[index - 1];
    const latestEdit = reading.edits && reading.edits.length ? reading.edits[0] : undefined;
    setEditingReading(reading);
    setEditValue(String(reading.value));
    setEditError('');
    setEditReason(latestEdit?.reason || '');
    setEditReasonError('');
    setEditBounds({
      min: prev ? prev.value : undefined,
      max: next ? next.value : undefined,
    });
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    if (editSaving) return;
    setEditDialogOpen(false);
    setEditingReading(null);
    setEditValue('');
    setEditError('');
    setEditReason('');
    setEditReasonError('');
    setEditBounds(null);
  };

  const handleSaveEdit = async () => {
    if (!editingReading) return;
    const numericValue = Number(editValue);
    const latestEdit = editingReading.edits && editingReading.edits.length ? editingReading.edits[0] : undefined;

    if (!Number.isFinite(numericValue)) {
      setEditError(t('accounts.readings.edit.error.invalidValue'));
      return;
    }

    if (!editReason.trim()) {
      setEditReasonError(t('accounts.readings.edit.error.reasonRequired'));
      return;
    }

    if (numericValue === editingReading.value && editReason.trim() === (latestEdit?.reason || '').trim()) {
      setEditError(t('accounts.readings.edit.error.noChange'));
      return;
    }

    if (editBounds?.min !== undefined && numericValue < editBounds.min) {
      setEditError(t('accounts.readings.edit.error.minValue', { min: editBounds.min }));
      return;
    }

    if (editBounds?.max !== undefined && numericValue > editBounds.max) {
      setEditError(t('accounts.readings.edit.error.maxValue', { max: editBounds.max }));
      return;
    }

    if (!viewerId || !viewerRole) {
      setEditError(t('accounts.readings.edit.error.missingEditor'));
      return;
    }

    setEditSaving(true);
    try {
      await ReadingsApi.updateReading(editingReading.id, {
        id: editingReading.id,
        value: numericValue,
        editReason,
        editorAccountId: viewerId,
        editorRole: viewerRole,
      });
      await mutateReadings();
      handleCloseEditDialog();
    } catch (error) {
      setEditError(t('accounts.readings.edit.error.updateFailed'));
    } finally {
      setEditSaving(false);
    }
  };

  const renderDetails = (
    <Grid size={{ xs: 12, md: 5 }}>
      <Card>
        {!mdUp && <CardHeader title={t('accounts.detail.editTitle')} />}
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="subtitle2">{t('accounts.detail.sectionTitle')}</Typography>
            <RHFTextField name="firstName" label={t('accounts.fields.firstName')} disabled={!canEdit} />
            <RHFTextField name="lastName" label={t('accounts.fields.lastName')} disabled={!canEdit} />
            <RHFTextField name="address" label={t('accounts.fields.address')} disabled={!canEdit} />
            <RHFTextField name="email" label={t('accounts.fields.email')} disabled />
            {isConsumer && (
              <RHFTextField
                name="tariffId"
                label={t('accounts.fields.tariff')}
                select
                disabled={!canEdit || tariffsLoading}
                helperText={
                  tariffsLoading
                    ? t('accounts.fields.tariffLoading')
                    : t('accounts.fields.tariffHelper')
                }
              >
                <MenuItem value="">{t('accounts.fields.tariffDefault')}</MenuItem>
                {tariffs.map((tariff) => (
                  <MenuItem key={tariff.id} value={tariff.id}>
                    {tariff.name}
                    {tariff.groupCode ? ` (${tariff.groupCode})` : ''}
                    {tariff.status === 'inactive' ? ` - ${t('accounts.fields.tariffInactive')}` : ''}
                  </MenuItem>
                ))}
              </RHFTextField>
            )}
            <Stack direction="row" justifyContent="flex-end">
              <LoadingButton type="submit" variant="contained" size="large" loading={isSubmitting} disabled={!canEdit}>
                {t('accounts.actions.saveChanges')}
              </LoadingButton>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Grid>
  );

  const renderBillingHistory = isConsumer && (
    <Grid size={{ xs: 12, md: 8 }}>
      <Card>
        <CardHeader title={t('accounts.billing.title')} />
        <CardContent>
          <Stack direction="row" spacing={2} mb={2}>
            <TextField
              label={t('accounts.billing.filters.createdFrom')}
              type="date"
              value={billingFrom}
              onChange={(event) => setBillingFrom(event.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{ minWidth: 160 }}
            />
            <TextField
              label={t('accounts.billing.filters.createdTo')}
              type="date"
              value={billingTo}
              onChange={(event) => setBillingTo(event.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{ minWidth: 160 }}
            />
            <TextField
              select
              label={t('accounts.billing.filters.status')}
              value={billingStatus}
              onChange={(event) => setBillingStatus(event.target.value as '' | InvoiceStatus)}
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="">{t('accounts.filters.all')}</MenuItem>
              {billingStatusOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Stack>

          <Tabs value={billingTab} onChange={(_, value) => setBillingTab(value)} sx={{ mb: 2 }}>
            <Tab value="chart" label={t('accounts.common.chart')} />
            <Tab value="table" label={t('accounts.common.table')} />
          </Tabs>

          {billingTab === 'chart' &&
            renderBillingContent(
              <ChartWrapper type="bar" series={billingChartSeries} options={billingChartOptions} height={320} />
            )}

          {billingTab === 'table' &&
            renderBillingContent(
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ width: 180 }}>{t('accounts.billing.table.month')}</TableCell>
                      <TableCell sx={{ width: 120 }}>{t('accounts.billing.table.total')}</TableCell>
                      <TableCell sx={{ width: 120 }}>{t('accounts.billing.table.status')}</TableCell>
                      <TableCell sx={{ width: 80 }} align="right">
                        {t('accounts.billing.table.reviewFlags')}
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {billingBuckets.map((bucket) => {
                      const status = bucket.latestInvoice?.status;
                      const flags = Array.from(bucket.flags.values());
                      const invoice = bucket.latestInvoice;
                      const canEdit =
                        invoice?.status === 'draft' && bucket.key === currentMonthKey;
                      const canConfirm =
                        invoice?.status === 'draft' &&
                        bucket.key === currentMonthKey &&
                        (!invoice.reviewFlags || invoice.reviewFlags.length === 0);
                      return (
                        <TableRow key={bucket.key}>
                          <TableCell sx={{ width: 180 }}>{bucket.label}</TableCell>
                          <TableCell sx={{ width: 120 }}>
                            {formatCurrencyValue(bucket.total, appSettings?.currency)}
                          </TableCell>
                          <TableCell sx={{ width: 120 }}>
                            {status ? (
                              <Chip
                                size="small"
                                label={t(`accounts.billing.status.${status}`)}
                                color={getInvoiceStatusColor(status)}
                                clickable={canConfirm}
                                onClick={canConfirm && invoice ? () => handleOpenConfirmDialog(invoice) : undefined}
                              />
                            ) : (
                              ''
                            )}
                          </TableCell>
                          <TableCell sx={{ width: 80 }} align="right">
                            <Stack direction="row" spacing={1} alignItems="center" justifyContent="flex-end">
                              {flags.length > 0 && (
                                <Tooltip
                                  title={
                                    <Stack spacing={0.5} sx={{ py: 0.5 }}>
                                      {flags.map((flag) => (
                                        <Typography key={flag} variant="caption" display="block">
                                          {flag}
                                        </Typography>
                                      ))}
                                    </Stack>
                                  }
                                >
                                  <IconButton
                                    size="small"
                                    color="warning"
                                    onClick={canEdit && invoice ? () => handleOpenReviewDialog(invoice) : undefined}
                                    aria-label={t('accounts.billing.table.reviewFlags')}
                                  >
                                    <Iconify icon="eva:alert-circle-fill" width={16} />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
        </CardContent>
      </Card>
    </Grid>
  );

  const renderReadingsHistory = isStaffField && (
    <Grid size={{ xs: 12, md: 8 }}>
      <Card>
        <CardHeader title={t('accounts.readings.title')} />
        <CardContent>
          <Stack direction="row" spacing={2} mb={2}>
            <TextField
              label={t('accounts.readings.filters.from')}
              type="date"
              value={readingFrom}
              onChange={(event) => setReadingFrom(event.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{ minWidth: 160 }}
            />
            <TextField
              label={t('accounts.readings.filters.to')}
              type="date"
              value={readingTo}
              onChange={(event) => setReadingTo(event.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{ minWidth: 160 }}
            />
            <TextField
              select
              label={t('accounts.readings.filters.meter')}
              value={selectedMeterId}
              onChange={(event) => setSelectedMeterId(event.target.value)}
              sx={{ minWidth: 220 }}
              disabled={!meterOptions.length}
            >
              {meterOptions.map((meter) => (
                <MenuItem key={meter.id} value={meter.id}>
                  {formatMeterLabel(meter)}
                </MenuItem>
              ))}
            </TextField>
          </Stack>

          <Tabs value={readingsTab} onChange={(_, value) => setReadingsTab(value)} sx={{ mb: 2 }}>
            <Tab value="chart" label={t('accounts.common.chart')} />
            <Tab value="table" label={t('accounts.common.table')} />
          </Tabs>

          {readingsTab === 'chart' &&
            renderReadingsContent(
              hasChartData ? (
                <ChartWrapper type="bar" series={chartSeries} options={chartOptions} height={360} />
              ) : (
                <Typography variant="body2">{t('accounts.readings.chart.emptyHint')}</Typography>
              )
            )}

          {readingsTab === 'table' &&
            renderReadingsContent(
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ width: 140 }}>{t('accounts.readings.table.date')}</TableCell>
                      <TableCell sx={{ width: 140 }}>{t('accounts.readings.table.method')}</TableCell>
                      <TableCell sx={{ width: 120 }}>{t('accounts.readings.table.value')}</TableCell>
                      <TableCell sx={{ width: 140 }}>{t('accounts.readings.table.consumption')}</TableCell>
                      <TableCell sx={{ width: 200 }}>{t('accounts.readings.table.edited')}</TableCell>
                      <TableCell>{t('accounts.readings.table.meter')}</TableCell>
                      <TableCell sx={{ width: 80 }}>{t('accounts.readings.table.actions')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredReadings.map((reading, index) => {
                      const prev = filteredReadings[index + 1];
                      const consumption = prev ? roundReadingValue(reading.value - prev.value) : undefined;
                      const latestEdit = reading.edits && reading.edits.length ? reading.edits[0] : undefined;
                      const editorName = latestEdit
                        ? [latestEdit.editorFirstName, latestEdit.editorLastName].filter(Boolean).join(' ')
                        : '';

                      return (
                        <TableRow key={reading.id}>
                          <TableCell sx={{ width: 140 }}>{reading.readAt?.slice(0, 10)}</TableCell>
                          <TableCell sx={{ width: 140 }}>{reading.method}</TableCell>
                          <TableCell sx={{ width: 120 }}>{formatReadingValue(reading.value)}</TableCell>
                          <TableCell sx={{ width: 140 }}>
                            {formatReadingValue(consumption)}
                          </TableCell>
                          <TableCell sx={{ width: 200 }}>
                            {latestEdit ? (
                              <Tooltip title={latestEdit.reason || t('accounts.readings.table.noReason')}>
                                <span>{editorName || '-'}</span>
                              </Tooltip>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell>{reading.meter?.serialNumber || reading.meterId}</TableCell>
                          <TableCell sx={{ width: 80 }}>
                            <IconButton
                              size="small"
                              disabled={!canEditReadings}
                              onClick={() => handleOpenEditDialog(reading, index)}
                              aria-label={t('accounts.readings.actions.edit')}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
        </CardContent>
      </Card>
    </Grid>
  );

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={3} columns={{ xs: 12, md: 13 }}>
        {renderDetails}
        {renderBillingHistory}
        {renderReadingsHistory}
      </Grid>

      <Dialog open={editDialogOpen} onClose={handleCloseEditDialog} fullWidth maxWidth="sm">
        <DialogTitle>{t('accounts.readings.edit.title')}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label={t('accounts.readings.edit.valueLabel')}
              type="number"
              value={editValue}
              onChange={(event) => {
                setEditValue(event.target.value);
                if (editError) setEditError('');
              }}
              inputProps={{ step: '0.01' }}
              error={Boolean(editError)}
              helperText={
                editError ||
                (editBounds
                  ? t('accounts.readings.edit.allowedRange', {
                      min: editBounds.min ?? t('accounts.readings.edit.rangeNone'),
                      max: editBounds.max ?? t('accounts.readings.edit.rangeNone'),
                    })
                  : undefined)
              }
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              label={t('accounts.readings.edit.reasonLabel')}
              value={editReason}
              onChange={(event) => {
                setEditReason(event.target.value);
                if (editReasonError) setEditReasonError('');
              }}
              error={Boolean(editReasonError)}
              helperText={editReasonError || t('validation.required')}
              multiline
              minRows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog} disabled={editSaving}>
            {t('accounts.actions.cancel')}
          </Button>
          <Button onClick={handleSaveEdit} variant="contained" disabled={editSaving}>
            {t('accounts.actions.save')}
          </Button>
        </DialogActions>
      </Dialog>

      <ReadingsReviewDialog
        open={reviewDialogOpen}
        onClose={handleCloseReviewDialog}
        invoice={reviewInvoice}
        isShared={Boolean(reviewInvoice?.reviewFlags?.includes('invalid_household_size'))}
        onReviewed={mutateInvoices}
      />

      <ConfirmDialog
        open={confirmDialogOpen}
        onClose={handleCloseConfirmDialog}
        title={t('accounts.billing.confirm.title')}
        content={
          <Stack spacing={1.5}>
            <Typography variant="body2">
              {t('accounts.billing.confirm.message')}
            </Typography>
            {confirmInvoice?.lines && confirmInvoice.lines.length > 0 ? (
              <Stack spacing={1}>
                <Typography variant="subtitle2">{t('accounts.billing.confirm.itemsTitle')}</Typography>
                <Stack spacing={0.5}>
                  {confirmInvoice.lines.map((line) => (
                    <Stack
                      key={line.id}
                      direction="row"
                      spacing={1}
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography variant="body2" color="text.secondary">
                        {line.description || line.type}
                      </Typography>
                      <Typography variant="body2">
                        {formatCurrencyValue(line.amount, appSettings?.currency)}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">
                {t('accounts.billing.confirm.empty')}
              </Typography>
            )}
          </Stack>
        }
        action={
          <Button variant="contained" color="primary" onClick={handleConfirmInvoice}>
            {t('accounts.billing.confirm.action')}
          </Button>
        }
      />

      <Dialog open={addressPromptOpen} onClose={() => setAddressPromptOpen(false)}>
        <DialogTitle>{t('accounts.addressPrompt.title')}</DialogTitle>
        <DialogContent>
          <Typography variant="body2">{t('accounts.addressPrompt.message')}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleAddressDecision(false)}>
            {t('accounts.addressPrompt.keep')}
          </Button>
          <Button onClick={() => handleAddressDecision(true)} variant="contained">
            {t('accounts.addressPrompt.update')}
          </Button>
        </DialogActions>
      </Dialog>
    </FormProvider>
  );
}
