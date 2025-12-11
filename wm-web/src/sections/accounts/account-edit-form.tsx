import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Grid from '@mui/material/Grid2';
// routes
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
// locales
import { useLocales } from 'src/locales';
// hooks
import { useResponsive } from 'src/hooks/use-responsive';
// utils
// api
// components
import FormProvider from 'src/components/hook-form';
// types
import { AccountRow } from 'src/api/accounts';


// ----------------------------------------------------------------------

type Props = {
  currentAccount?: AccountRow;
};

export default function AccountEditForm({ currentAccount }: Props) {

  const { t } = useLocales();

  const router = useRouter();

  const mdUp = useResponsive('up', 'md');


  const defaultValues = useMemo(
    () => ({
      id: currentAccount?.id,
      // TODO populate default values

    }),
    [currentAccount],
  );

  const methods = useForm({
    resolver: yupResolver(AccountSchema), // TODO create accountSchema
    defaultValues,
    mode: 'onChange',
  });

  const {
    watch,
    setValue,
    reset,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = methods;

  const values = watch();

  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (currentAccount) {
      reset(defaultValues);
    }
  }, [currentAccount, defaultValues, reset]);


  const onSubmit = async (data: any) => {
    try {
      const formData = new FormData();
      reset();
      router.push(paths.dashboard.accounts.root);
    } catch (error) {
      console.error(error);
    }
  };



  const renderDetails = (
    <Grid>
      <Card>
        {!mdUp && <CardHeader title='Edit account' />}
        <Grid>
        // TODO put all editable account props
        </Grid>

      </Card>
    </Grid>
  );

  const renderActions = (
    <>
      {mdUp && <Grid  />}
      <Grid sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', columnGap: 1 }}>
        <LoadingButton type="submit"
          variant="contained"
          size="large"
          loading={isSubmitting}
        >
          'save_changes'
        </LoadingButton>
      </Grid>
    </>
  );

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={3}>
        {renderDetails}
        {renderActions}
      </Grid>
    </FormProvider>
  );
}
