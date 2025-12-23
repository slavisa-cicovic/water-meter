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
// routes
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
// locales
import { useLocales } from 'src/locales';
// hooks
import { useResponsive } from 'src/hooks/use-responsive';
// api
import { useGetInvoices } from 'src/api/billing';
import { useGetReadings } from 'src/api/readings';
// auth
import { useAuthContext } from 'src/auth/hooks';
// components
import FormProvider, { RHFTextField } from 'src/components/hook-form';
import { ChartWrapper, useChart } from 'src/components/chart';
// types
import { AccountRow } from 'src/types/accounts';

// ----------------------------------------------------------------------

type Props = {
  currentAccount?: AccountRow;
};

export default function AccountEditForm({ currentAccount }: Props) {
  const { t } = useLocales();
  const router = useRouter();
  const mdUp = useResponsive('up', 'md');
  const { user } = useAuthContext();

  const AccountSchema = Yup.object().shape({
    firstName: Yup.string().required('Required'),
    lastName: Yup.string().required('Required'),
    address: Yup.string().required('Required'),
  });

  const defaultValues = useMemo(
    () => ({
      id: currentAccount?.id,
      firstName: currentAccount?.data.firstName || '',
      lastName: currentAccount?.data.lastName || '',
      address: currentAccount?.data.address || '',
      email: currentAccount?.data.email || '',
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
      console.info('[AccountEditForm] Save account', { data, updateMeterAddress });
      reset();
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
  const { readings, readingsLoading, readingsEmpty } = useGetReadings(
    isStaffField && accountId
      ? { accountId, from: readingFrom || undefined, to: readingTo || undefined }
      : undefined
  );

  const readingsChartData = useMemo(() => {
    if (!readings?.length) return { categories: [] as string[], data: [] as number[] };

    const totals = new Map<number, { label: string; total: number }>();

    readings.forEach((reading, index) => {
      const prev = readings[index + 1];
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
  }, [readings]);

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

  const renderReadingsContent = (content: ReactNode) => {
    if (readingsLoading) return <Typography variant="body2">Loading readings...</Typography>;
    if (readingsEmpty) return <Typography variant="body2">No readings found.</Typography>;
    return content;
  };

  const renderDetails = (
    <Grid>
      <Card>
        {!mdUp && <CardHeader title="Edit account" />}
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="subtitle2">Account details</Typography>
            <RHFTextField name="firstName" label="First name" disabled={!canEdit} />
            <RHFTextField name="lastName" label="Last name" disabled={!canEdit} />
            <RHFTextField name="address" label="Address" disabled={!canEdit} />
            <RHFTextField name="email" label="Email" disabled />
          </Stack>
        </CardContent>
      </Card>
    </Grid>
  );

  const renderBillingHistory = isConsumer && (
    <Grid>
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
    <Grid>
      <Card>
        <CardHeader title="Readings history" />
        <CardContent>
          <Stack direction="row" spacing={2} mb={2}>
            <TextField
              label="From"
              type="date"
              value={readingFrom}
              onChange={(event) => setReadingFrom(event.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 160 }}
            />
            <TextField
              label="To"
              type="date"
              value={readingTo}
              onChange={(event) => setReadingTo(event.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 160 }}
            />
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
                      <TableCell sx={{ width: 200 }}>Edit</TableCell>
                      <TableCell>Meter</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {readings.map((reading, index) => {
                      const prev = readings[index + 1];
                      const consumption = prev ? reading.value - prev.value : undefined;
                      const latestEdit = reading.edits && reading.edits.length ? reading.edits[0] : undefined;
                      const editInfo = latestEdit ? `Edited by ${latestEdit.editorRole}` : '';

                      return (
                        <TableRow key={reading.id}>
                          <TableCell sx={{ width: 140 }}>{reading.readAt?.slice(0, 10)}</TableCell>
                          <TableCell sx={{ width: 140 }}>{reading.method}</TableCell>
                          <TableCell sx={{ width: 120 }}>{reading.value}</TableCell>
                          <TableCell sx={{ width: 140 }}>{consumption !== undefined ? consumption : '-'}</TableCell>
                          <TableCell sx={{ width: 200 }}>{editInfo}</TableCell>
                          <TableCell>{reading.meter?.serialNumber || reading.meterId}</TableCell>
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

  const renderActions = (
    <>
      {mdUp && <Grid />}
      <Grid sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', columnGap: 1 }}>
        <LoadingButton type="submit" variant="contained" size="large" loading={isSubmitting} disabled={!canEdit}>
          save_changes
        </LoadingButton>
      </Grid>
    </>
  );

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={3}>
        {renderDetails}
        {renderBillingHistory}
        {renderReadingsHistory}
        {renderActions}
      </Grid>

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
