import LoadingButton from '@mui/lab/LoadingButton';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid2';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { RHFTextField } from 'src/components/hook-form';

type RoleOption = { value: string; label: string };

type TariffOption = {
  id: string;
  name: string;
  groupCode?: string | null;
  status?: string | null;
};

type Props = {
  mdUp: boolean;
  t: (key: string, options?: Record<string, any>) => string;
  canEdit: boolean;
  canAssignRole: boolean;
  rolesLoading: boolean;
  roleOptions: RoleOption[];
  isConsumer: boolean;
  tariffs: TariffOption[];
  tariffsLoading: boolean;
  isSubmitting: boolean;
};

export default function AccountDetailsSection({
  mdUp,
  t,
  canEdit,
  canAssignRole,
  rolesLoading,
  roleOptions,
  isConsumer,
  tariffs,
  tariffsLoading,
  isSubmitting,
}: Props) {
  return (
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
            {canAssignRole && (
              <RHFTextField
                name="roleSlug"
                label={t('accounts.fields.role')}
                select
                disabled={!canEdit || rolesLoading}
              >
                {roleOptions.map((role) => (
                  <MenuItem key={role.value} value={role.value}>
                    {role.label}
                  </MenuItem>
                ))}
              </RHFTextField>
            )}
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
}
