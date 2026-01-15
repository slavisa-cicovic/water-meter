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
import { useLocales } from 'src/locales';

type Props = {
  currentTariff?: Tariff;
};

const toDateInput = (value?: string) => (value ? value.slice(0, 10) : '');

export function TariffEditForm({ currentTariff }: Props) {
  const { t } = useLocales();
  const router = useRouter();
  const isCreate = !currentTariff;

  const TariffSchema = Yup.object().shape({
    name: Yup.string().required(t('validation.required')),
    basePrice: Yup.number().min(0, t('validation.min', { min: 0 })).required(t('validation.required')),
    greenLimit: Yup.number()
      .integer()
      .min(0, t('validation.min', { min: 0 }))
      .required(t('validation.required')),
    blueLimit: Yup.number()
      .integer()
      .min(0, t('validation.min', { min: 0 }))
      .required(t('validation.required')),
    blueMultiplier: Yup.number().min(0, t('validation.min', { min: 0 })).required(t('validation.required')),
    redMultiplier: Yup.number().min(0, t('validation.min', { min: 0 })).required(t('validation.required')),
    validFrom: Yup.string().required(t('validation.required')),
    validTo: Yup.string().nullable(),
    groupCode: Yup.string().nullable(),
    status: Yup.string().oneOf(['active', 'inactive']).required(t('validation.required')),
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
    console.log('......................................')
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
      if (id) router.push(paths.dashboard.billing.tariffs.root);
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
            <CardHeader title={isCreate ? t('billing.tariffs.form.createTitle') : t('billing.tariffs.form.detailTitle')} />
            <CardContent>
              <Stack spacing={2}>
                <RHFTextField name="name" label={t('billing.tariffs.form.fields.name')} />
                <RHFTextField name="groupCode" label={t('billing.tariffs.form.fields.groupCode')} />
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <RHFTextField name="basePrice" label={t('billing.tariffs.form.fields.basePrice')} type="number" />
                  <RHFTextField name="greenLimit" label={t('billing.tariffs.form.fields.greenLimit')} type="number" />
                  <RHFTextField name="blueLimit" label={t('billing.tariffs.form.fields.blueLimit')} type="number" />
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <RHFTextField
                    name="blueMultiplier"
                    label={t('billing.tariffs.form.fields.blueMultiplier')}
                    type="number"
                  />
                  <RHFTextField
                    name="redMultiplier"
                    label={t('billing.tariffs.form.fields.redMultiplier')}
                    type="number"
                  />
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <RHFTextField
                    name="validFrom"
                    label={t('billing.tariffs.form.fields.validFrom')}
                    type="date"
                    slotProps={{ inputLabel: { shrink: true } }}
                    sx={{ flex: 1 }}
                  />
                  <RHFTextField
                    name="validTo"
                    label={t('billing.tariffs.form.fields.validTo')}
                    type="date"
                    slotProps={{ inputLabel: { shrink: true } }}
                    sx={{ flex: 1 }}
                  />
                </Stack>
                <TextField
                  select
                  label={t('billing.tariffs.form.fields.status')}
                  value={methods.getValues('status')}
                  onChange={(event) =>
                    methods.setValue('status', event.target.value as 'active' | 'inactive')
                  }
                >
                  <MenuItem value="active">{t('billing.tariffs.status.active')}</MenuItem>
                  <MenuItem value="inactive">{t('billing.tariffs.status.inactive')}</MenuItem>
                </TextField>
              </Stack>
              <Stack direction="row" justifyContent="flex-end" spacing={1} sx={{ mt: 3 }}>
                <Button variant="outlined" onClick={handleCancel}>
                  {t('billing.tariffs.form.cancel')}
                </Button>
                <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                  {isCreate ? t('billing.tariffs.form.create') : t('billing.tariffs.form.saveChanges')}
                </LoadingButton>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
