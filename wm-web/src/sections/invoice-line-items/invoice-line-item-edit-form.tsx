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
import { useEffect, useMemo } from 'react';
import FormProvider, { RHFTextField } from 'src/components/hook-form';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { InvoiceLineItemsApi } from 'src/api/billing';
import { InvoiceLineItem } from 'src/types/billings';
import { useLocales } from 'src/locales';

type Props = {
  currentLineItem?: InvoiceLineItem;
};

export function InvoiceLineItemEditForm({ currentLineItem }: Props) {
  const { t } = useLocales();
  const router = useRouter();
  const isCreate = !currentLineItem;

  const LineItemSchema = Yup.object().shape({
    name: Yup.string().required(t('validation.required')),
    description: Yup.string().nullable(),
    isPercentage: Yup.boolean().required(t('validation.required')),
    value: Yup.number().min(0, t('validation.min', { min: 0 })).required(t('validation.required')),
  });

  const defaultValues = useMemo(
    () => ({
      name: currentLineItem?.name || '',
      description: currentLineItem?.description || '',
      isPercentage: currentLineItem?.isPercentage ?? true,
      value: currentLineItem?.value ? Number(currentLineItem.value) : 0,
    }),
    [currentLineItem]
  );

  const methods = useForm({
    resolver: yupResolver(LineItemSchema),
    defaultValues,
    mode: 'onChange',
  });

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = methods;
  const isPercentage = methods.watch('isPercentage');

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const onSubmit = async (data: any) => {
    const payload = {
      name: data.name,
      description: data.description || null,
      isPercentage: Boolean(data.isPercentage),
      value: Number(data.value),
    };

    if (isCreate) {
      const result = await InvoiceLineItemsApi.createLineItem(payload);
      const id = result?.lineItem?.id;
      if (id) router.push(paths.dashboard.billing.lineItems.root);
      return;
    }

    if (currentLineItem?.id) {
      await InvoiceLineItemsApi.updateLineItem({ ...payload, id: currentLineItem.id });
      router.push(paths.dashboard.billing.lineItems.root);
    }
  };

  const handleCancel = () => {
    if (isCreate) {
      router.push(paths.dashboard.billing.lineItems.root);
      return;
    }
    reset(defaultValues);
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ width: 1 }}>
            <CardHeader
              title={
                isCreate
                  ? t('billing.lineItems.form.createTitle')
                  : t('billing.lineItems.form.detailTitle')
              }
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <RHFTextField
                    name="name"
                    label={t('billing.lineItems.form.fields.name')}
                    slotProps={{ htmlInput: { maxLength: 40 } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 8 }}>
                  <RHFTextField
                    name="description"
                    label={t('billing.lineItems.form.fields.description')}
                    slotProps={{ htmlInput: { maxLength: 120 } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 2 }}>
                  <TextField
                    select
                    label={t('billing.lineItems.form.fields.type')}
                    value={isPercentage ? 'percentage' : 'fixed'}
                    onChange={(event) =>
                      methods.setValue('isPercentage', event.target.value === 'percentage')
                    }
                    sx={{ width: 1 }}
                  >
                    <MenuItem value="percentage">{t('billing.lineItems.type.percentage')}</MenuItem>
                    <MenuItem value="fixed">{t('billing.lineItems.type.fixed')}</MenuItem>
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, md: 2 }}>
                  <RHFTextField
                    name="value"
                    label={t('billing.lineItems.form.fields.value')}
                    type="number"
                  />
                </Grid>
              </Grid>
              <Stack direction="row" justifyContent="flex-end" spacing={1} sx={{ mt: 3 }}>
                <Button variant="outlined" onClick={handleCancel}>
                  {t('billing.lineItems.form.cancel')}
                </Button>
                <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                  {isCreate ? t('billing.lineItems.form.create') : t('billing.lineItems.form.saveChanges')}
                </LoadingButton>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
