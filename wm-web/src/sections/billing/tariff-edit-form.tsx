import { yupResolver } from '@hookform/resolvers/yup';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Grid from '@mui/material/Grid2';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import LoadingButton from '@mui/lab/LoadingButton';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import FormProvider, { RHFTextField } from 'src/components/hook-form';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { TariffsApi } from 'src/api/billing';
import { Tariff } from 'src/types/billings';
import { useMemo } from 'react';

type Props = {
  currentTariff?: Tariff;
};

const toDateInput = (value?: string) => (value ? value.slice(0, 10) : '');

export function TariffEditForm({ currentTariff }: Props) {
  const router = useRouter();
  const isCreate = !currentTariff;

  const TariffSchema = Yup.object().shape({
    name: Yup.string().required('Required'),
    basePrice: Yup.number().min(0, 'Must be >= 0').required('Required'),
    greenLimit: Yup.number().integer().min(0, 'Must be >= 0').required('Required'),
    blueLimit: Yup.number().integer().min(0, 'Must be >= 0').required('Required'),
    blueMultiplier: Yup.number().min(0, 'Must be >= 0').required('Required'),
    redMultiplier: Yup.number().min(0, 'Must be >= 0').required('Required'),
    validFrom: Yup.string().required('Required'),
    validTo: Yup.string().nullable(),
    groupCode: Yup.string().nullable(),
    status: Yup.string().oneOf(['active', 'inactive']).required('Required'),
  });

  const defaultValues = useMemo(
    () => ({
      name: currentTariff?.name || '',
      basePrice: currentTariff?.basePrice ? Number(currentTariff.basePrice) : 0,
      greenLimit: currentTariff?.greenLimit ?? 0,
      blueLimit: currentTariff?.blueLimit ?? 0,
      blueMultiplier: currentTariff?.blueMultiplier ? Number(currentTariff.blueMultiplier) : 0,
      redMultiplier: currentTariff?.redMultiplier ? Number(currentTariff.redMultiplier) : 0,
      validFrom: toDateInput(currentTariff?.validFrom),
      validTo: toDateInput(currentTariff?.validTo),
      groupCode: currentTariff?.groupCode || '',
      status: currentTariff?.status || 'active',
    }),
    [currentTariff]
  );

  const methods = useForm({
    resolver: yupResolver(TariffSchema),
    defaultValues,
    mode: 'onChange',
  });

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = async (data: any) => {
    const payload = {
      name: data.name,
      basePrice: Number(data.basePrice),
      greenLimit: Number(data.greenLimit),
      blueLimit: Number(data.blueLimit),
      blueMultiplier: Number(data.blueMultiplier),
      redMultiplier: Number(data.redMultiplier),
      validFrom: data.validFrom,
      validTo: data.validTo || null,
      groupCode: data.groupCode || null,
      status: data.status,
    };

    if (isCreate) {
      const result = await TariffsApi.createTariff(payload);
      const id = result?.tariff?.id;
      if (id) router.push(paths.dashboard.billing.tariffs.details(id));
      return;
    }

    if (currentTariff?.id) {
      await TariffsApi.updateTariff({ ...payload, id: currentTariff.id });
      router.push(paths.dashboard.billing.tariffs.root);
    }
  };

  const handleCancel = () => {
    if (isCreate) {
      router.push(paths.dashboard.billing.tariffs.root);
      return;
    }
    reset(defaultValues);
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={3}>
        <Grid>
          <Card>
            <CardHeader title={isCreate ? 'Create tariff' : 'Tariff details'} />
            <CardContent>
              <Stack spacing={2}>
                <RHFTextField name="name" label="Name" />
                <RHFTextField name="groupCode" label="Group code (optional)" />
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <RHFTextField name="basePrice" label="Base price" type="number" />
                  <RHFTextField name="greenLimit" label="Green limit" type="number" />
                  <RHFTextField name="blueLimit" label="Blue limit" type="number" />
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <RHFTextField name="blueMultiplier" label="Blue multiplier" type="number" />
                  <RHFTextField name="redMultiplier" label="Red multiplier" type="number" />
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    label="Valid from"
                    type="date"
                    value={methods.getValues('validFrom')}
                    onChange={(event) => methods.setValue('validFrom', event.target.value)}
                    slotProps={{ inputLabel: { shrink: true } }}
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    label="Valid to"
                    type="date"
                    value={methods.getValues('validTo')}
                    onChange={(event) => methods.setValue('validTo', event.target.value)}
                    slotProps={{ inputLabel: { shrink: true } }}
                    sx={{ flex: 1 }}
                  />
                </Stack>
                <TextField
                  select
                  label="Status"
                  value={methods.getValues('status')}
                  onChange={(event) => methods.setValue('status', event.target.value)}
                >
                  <MenuItem value="active">active</MenuItem>
                  <MenuItem value="inactive">inactive</MenuItem>
                </TextField>
              </Stack>
              <Stack direction="row" justifyContent="flex-end" spacing={1} sx={{ mt: 3 }}>
                <Button variant="outlined" onClick={handleCancel}>
                  Cancel
                </Button>
                <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                  {isCreate ? 'Create tariff' : 'Save changes'}
                </LoadingButton>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
