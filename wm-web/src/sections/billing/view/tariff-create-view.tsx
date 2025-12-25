'use client';

import { Container } from '@mui/material';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { paths } from 'src/routes/paths';
import { TariffEditForm } from '../tariff-edit-form';

export function TariffCreateView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="New tariff"
        description="Create a new tariff definition."
        links={[
          { name: 'App', href: paths.dashboard.root },
          { name: 'Billing', href: paths.dashboard.billing.root },
          { name: 'Tariffs', href: paths.dashboard.billing.tariffs.root },
          { name: 'New' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />
      <TariffEditForm />
    </Container>
  );
}
