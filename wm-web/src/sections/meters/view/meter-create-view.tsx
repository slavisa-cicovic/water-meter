'use client';

import { Container } from '@mui/material';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { paths } from 'src/routes/paths';
import { useLocales } from 'src/locales';
import { MeterEditForm } from '../meter-edit-form';

export function MeterCreateView() {
  const settings = useSettingsContext();
  const { t } = useLocales();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading={t('meters.create.title')}
        description={t('meters.create.description')}
        links={[
          { name: t('sidebar.app'), href: paths.dashboard.root },
          { name: t('meters.title'), href: paths.dashboard.meters.root },
          { name: t('meters.create.breadcrumbs.new') },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />
      <MeterEditForm />
    </Container>
  );
}
