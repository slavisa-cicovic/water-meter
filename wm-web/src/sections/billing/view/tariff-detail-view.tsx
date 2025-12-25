'use client';

import { Container } from '@mui/material';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { paths } from 'src/routes/paths';
import { TariffEditForm } from '../tariff-edit-form';
import { useGetTariff } from 'src/api/billing';
import EmptyContent from 'src/components/empty-content';
import Button from '@mui/material/Button';
import Iconify from 'src/components/iconify';
import { RouterLink } from 'src/routes/components';

type Props = {
  id: string;
};

export function TariffDetailView({ id }: Props) {
  const settings = useSettingsContext();
  const { tariff, tariffLoading, tariffError } = useGetTariff(id);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Tariff details"
        description="Review and update tariff settings."
        links={[
          { name: 'App', href: paths.dashboard.root },
          { name: 'Billing', href: paths.dashboard.billing.root },
          { name: 'Tariffs', href: paths.dashboard.billing.tariffs.root },
          { name: 'Detail' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      {tariffError && (
        <EmptyContent
          filled
          title="Failed to load tariff."
          action={
            <Button
              component={RouterLink}
              href={paths.dashboard.billing.tariffs.root}
              startIcon={<Iconify icon="eva:arrow-ios-back-fill" width={16} />}
              sx={{ mt: 3 }}
            >
              Back to tariffs
            </Button>
          }
          sx={{ py: 6 }}
        />
      )}

      {!tariffLoading && tariff && <TariffEditForm currentTariff={tariff} />}
    </Container>
  );
}
