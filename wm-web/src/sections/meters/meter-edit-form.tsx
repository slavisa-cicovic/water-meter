import { yupResolver } from '@hookform/resolvers/yup';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Grid from '@mui/material/Grid2';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import TableContainer from '@mui/material/TableContainer';
import Button from '@mui/material/Button';
import LoadingButton from '@mui/lab/LoadingButton';
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import FormProvider, { RHFTextField } from 'src/components/hook-form';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { useGetInvoices } from 'src/api/billing';
import { Meter } from 'src/types/meters';
import { useState } from 'react';
import { useGetAccounts } from 'src/api/accounts';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import { MetersApi } from 'src/api/meters-actions';

type Props = {
  currentMeter?: Meter;
};

export function MeterEditForm({ currentMeter }: Props) {
  const router = useRouter();
  const isCreate = !currentMeter;

  const MeterSchema = Yup.object().shape({
    serialNumber: Yup.string().required('Required'),
    address: Yup.string().required('Required'),
    type: Yup.string().required('Required'),
  });

  const defaultValues = {
    serialNumber: currentMeter?.serialNumber || '',
    groupCode: currentMeter?.groupCode || '',
    address: currentMeter?.address || '',
    type: currentMeter?.type || 'mechanical',
  };

  const methods = useForm({
    resolver: yupResolver(MeterSchema),
    defaultValues,
    mode: 'onChange',
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const [selectedConsumers, setSelectedConsumers] = useState<string[]>([]);

  const { accounts } = useGetAccounts({ type: 'consumer' });

  const meterId = currentMeter?.id;
  const { invoices, invoicesLoading, invoicesEmpty } = useGetInvoices(meterId ? { meterId } : undefined);

  const onSubmit = async (data: any) => {
    if (!isCreate) return;
    const result = await MetersApi.create({
      serialNumber: data.serialNumber,
      groupCode: data.groupCode || undefined,
      address: data.address,
      type: data.type,
      status: 'inactive',
    });

    if (result?.meterId) {
      if (selectedConsumers.length) {
        await Promise.all(
          selectedConsumers.map((accountId) => MetersApi.addConsumer(result.meterId, accountId))
        );
      }
      router.push(paths.dashboard.meters.details(result.meterId));
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={3}>
        <Grid>
          <Card>
            <CardHeader title={isCreate ? 'Register new meter' : 'Meter details'} />
            <CardContent>
              {isCreate ? (
                <Stack spacing={2}>
                  <RHFTextField name="serialNumber" label="Serial number" />
                  <RHFTextField name="groupCode" label="Group code (01-99)" />
                  <RHFTextField name="address" label="Address" />
                  <TextField
                    select
                    label="Type"
                    value={methods.getValues('type')}
                    onChange={(event) => methods.setValue('type', event.target.value)}
                  >
                    <MenuItem value="automatic">automatic</MenuItem>
                    <MenuItem value="mechanical">mechanical</MenuItem>
                  </TextField>
                  <TextField
                    select
                    label="Consumers"
                    slotProps={{ select: { multiple: true } }}
                    value={selectedConsumers}
                    onChange={(event) => setSelectedConsumers(event.target.value as unknown as string[])}
                  >
                    {accounts.map((acct) => (
                      <MenuItem key={acct.id} value={acct.id}>
                        {acct.data.firstName} {acct.data.lastName}
                      </MenuItem>
                    ))}
                  </TextField>
                  <Typography variant="caption" color="text.secondary">
                    Status is set to inactive on create.
                  </Typography>
                </Stack>
              ) : (
                <Stack spacing={1}>
                  <Typography variant="body2">Serial: {currentMeter?.serialNumber || '-'}</Typography>
                  <Typography variant="body2">Group: {currentMeter?.groupCode || '-'}</Typography>
                  <Typography variant="body2">Address: {currentMeter?.address || '-'}</Typography>
                  <Typography variant="body2">Type: {currentMeter?.type || '-'}</Typography>
                  <Typography variant="body2">Status: {currentMeter?.status || '-'}</Typography>
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>

        {!isCreate && (
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
        )}

        {isCreate && (
          <Grid sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', columnGap: 1 }}>
            <Button variant="outlined" onClick={() => router.push(paths.dashboard.meters.root)}>
              Cancel
            </Button>
            <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
              Create meter
            </LoadingButton>
          </Grid>
        )}
      </Grid>
    </FormProvider>
  );
}
