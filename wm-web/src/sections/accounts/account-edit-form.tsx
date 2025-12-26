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
// locales
import { useLocales } from 'src/locales';
// hooks
import { useResponsive } from 'src/hooks/use-responsive';
// api
import { useGetInvoices, useGetTariffs } from 'src/api/billing';
import { ReadingsApi, useGetReadings } from 'src/api/readings';
import { AccountsApi } from 'src/api/accounts';
// auth
import { useAuthContext } from 'src/auth/hooks';
// components
import FormProvider, { RHFTextField } from 'src/components/hook-form';
import { ChartWrapper, useChart } from 'src/components/chart';
// types
import { AccountRow } from 'src/types/accounts';
import { Reading } from 'src/types/readings';

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

  const AccountSchema = Yup.object().shape({
    firstName: Yup.string().required('Required'),
    lastName: Yup.string().required('Required'),
    address: Yup.string().required('Required'),
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
  const canEditReadings = viewerRole === 'staff_backoffice';
  const canEdit =
    (viewerRole === 'staff_backoffice' &&
      (currentAccount?.type === 'consumer' || currentAccount?.type === 'staff_field' || currentAccount?.id === viewerId)) ||
    (viewerRole === 'admin' && currentAccount?.id === viewerId);

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

  const { invoices, invoicesLoading, invoicesEmpty } = useGetInvoices(
    isConsumer && accountId ? { accountId } : undefined
  );

  const currentYear = new Date().getFullYear();
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
    return `Group: ${groupCode}, ${address}, ${serialNumber}`;
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
            title: { formatter: () => 'Consumption' },
          },
        },
      }),
      [readingsChartData.categories]
    )
  );

  const chartSeries = useMemo(
    () => [{ name: 'Consumption', data: readingsChartData.data }],
    [readingsChartData.data]
  );

  const hasChartData = readingsChartData.data.length > 0;
  const readingsFilteredEmpty = !readingsLoading && filteredReadings.length === 0;

  const renderReadingsContent = (content: ReactNode) => {
    if (readingsLoading) return <Typography variant="body2">Loading readings...</Typography>;
    if (readingsEmpty || readingsFilteredEmpty) return <Typography variant="body2">No readings found.</Typography>;
    return content;
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
      setEditError('Enter a valid number.');
      return;
    }

    if (!editReason.trim()) {
      setEditReasonError('Reason is required.');
      return;
    }

    if (numericValue === editingReading.value && editReason.trim() === (latestEdit?.reason || '').trim()) {
      setEditError('Value or reason must change.');
      return;
    }

    if (editBounds?.min !== undefined && numericValue < editBounds.min) {
      setEditError(`Value must be >= ${editBounds.min}.`);
      return;
    }

    if (editBounds?.max !== undefined && numericValue > editBounds.max) {
      setEditError(`Value must be <= ${editBounds.max}.`);
      return;
    }

    if (!viewerId || !viewerRole) {
      setEditError('Missing editor information.');
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
      setEditError('Failed to update reading.');
    } finally {
      setEditSaving(false);
    }
  };

  const renderDetails = (
    <Grid size={{ xs: 12, md: 5 }}>
      <Card>
        {!mdUp && <CardHeader title="Edit account" />}
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="subtitle2">Account details</Typography>
            <RHFTextField name="firstName" label="First name" disabled={!canEdit} />
            <RHFTextField name="lastName" label="Last name" disabled={!canEdit} />
            <RHFTextField name="address" label="Address" disabled={!canEdit} />
            <RHFTextField name="email" label="Email" disabled />
            {isConsumer && (
              <RHFTextField
                name="tariffId"
                label="Tariff"
                select
                disabled={!canEdit || tariffsLoading}
                helperText={tariffsLoading ? 'Loading tariffs...' : 'Override billing tariff (optional).'}
              >
                <MenuItem value="">Default (meter)</MenuItem>
                {tariffs.map((tariff) => (
                  <MenuItem key={tariff.id} value={tariff.id}>
                    {tariff.name}
                    {tariff.groupCode ? ` (${tariff.groupCode})` : ''}
                    {tariff.status === 'inactive' ? ' - inactive' : ''}
                  </MenuItem>
                ))}
              </RHFTextField>
            )}
            <Stack direction="row" justifyContent="flex-end">
              <LoadingButton type="submit" variant="contained" size="large" loading={isSubmitting} disabled={!canEdit}>
                save_changes
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
        <CardHeader title="Billing history" />
        <CardContent>
          {invoicesLoading && <Typography variant="body2">Loading invoices...</Typography>}
          {!invoicesLoading && invoicesEmpty && <Typography variant="body2">No invoices found.</Typography>}
          {!invoicesLoading && invoices && invoices.length > 0 && (
            <TableContainer>
              <Table size="small">
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell sx={{ width: 160 }}>
                        {invoice.periodStart?.slice(0, 10)} → {invoice.periodEnd?.slice(0, 10)}
                      </TableCell>
                      <TableCell sx={{ width: 120 }}>{invoice.totalAmount}</TableCell>
                      <TableCell sx={{ width: 120 }}>{invoice.status}</TableCell>
                    </TableRow>
                  ))}
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
        <CardHeader title="Readings history" />
        <CardContent>
          <Stack direction="row" spacing={2} mb={2}>
            <TextField
              label="From"
              type="date"
              value={readingFrom}
              onChange={(event) => setReadingFrom(event.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{ minWidth: 160 }}
            />
            <TextField
              label="To"
              type="date"
              value={readingTo}
              onChange={(event) => setReadingTo(event.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{ minWidth: 160 }}
            />
            <TextField
              select
              label="Meter"
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
            <Tab value="chart" label="Chart" />
            <Tab value="table" label="Table" />
          </Tabs>

          {readingsTab === 'chart' &&
            renderReadingsContent(
              hasChartData ? (
                <ChartWrapper type="bar" series={chartSeries} options={chartOptions} height={360} />
              ) : (
                <Typography variant="body2">Add at least two readings to see consumption trends.</Typography>
              )
            )}

          {readingsTab === 'table' &&
            renderReadingsContent(
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ width: 140 }}>Date</TableCell>
                      <TableCell sx={{ width: 140 }}>Method</TableCell>
                      <TableCell sx={{ width: 120 }}>Value</TableCell>
                      <TableCell sx={{ width: 140 }}>Consumption</TableCell>
                      <TableCell sx={{ width: 200 }}>Edited</TableCell>
                      <TableCell>Meter</TableCell>
                      <TableCell sx={{ width: 80 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredReadings.map((reading, index) => {
                      const prev = filteredReadings[index + 1];
                      const consumption = prev ? reading.value - prev.value : undefined;
                      const latestEdit = reading.edits && reading.edits.length ? reading.edits[0] : undefined;
                      const editorName = latestEdit
                        ? [latestEdit.editorFirstName, latestEdit.editorLastName].filter(Boolean).join(' ')
                        : '';

                      return (
                        <TableRow key={reading.id}>
                          <TableCell sx={{ width: 140 }}>{reading.readAt?.slice(0, 10)}</TableCell>
                          <TableCell sx={{ width: 140 }}>{reading.method}</TableCell>
                          <TableCell sx={{ width: 120 }}>{reading.value}</TableCell>
                          <TableCell sx={{ width: 140 }}>{consumption !== undefined ? consumption : '-'}</TableCell>
                          <TableCell sx={{ width: 200 }}>
                            {latestEdit ? (
                              <Tooltip title={latestEdit.reason || 'No reason provided'}>
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
                              aria-label="Edit reading"
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
        <DialogTitle>Edit reading</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Value"
              type="number"
              value={editValue}
              onChange={(event) => {
                setEditValue(event.target.value);
                if (editError) setEditError('');
              }}
              error={Boolean(editError)}
              helperText={
                editError ||
                (editBounds
                  ? `Allowed range: min ${editBounds.min ?? 'none'}, max ${editBounds.max ?? 'none'}`
                  : undefined)
              }
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              label="Reason"
              value={editReason}
              onChange={(event) => {
                setEditReason(event.target.value);
                if (editReasonError) setEditReasonError('');
              }}
              error={Boolean(editReasonError)}
              helperText={editReasonError || 'Required'}
              multiline
              minRows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog} disabled={editSaving}>
            Cancel
          </Button>
          <Button onClick={handleSaveEdit} variant="contained" disabled={editSaving}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={addressPromptOpen} onClose={() => setAddressPromptOpen(false)}>
        <DialogTitle>Update meter address?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">Address changed. Do you want to update the meter address as well?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleAddressDecision(false)}>Keep meter address</Button>
          <Button onClick={() => handleAddressDecision(true)} variant="contained">
            Update meter address
          </Button>
        </DialogActions>
      </Dialog>
    </FormProvider>
  );
}
