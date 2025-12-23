'use client';

import { Container } from '@mui/material';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { paths } from 'src/routes/paths';
import { MeterEditForm } from '../meter-edit-form';

export function MeterCreateView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="New meter"
        description="Register a new meter as inactive."
        links={[
          { name: 'App', href: paths.dashboard.root },
          { name: 'Meters', href: paths.dashboard.meters.root },
          { name: 'New' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />
      <MeterEditForm />
    </Container>
  );
}
