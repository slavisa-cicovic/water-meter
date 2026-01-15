'use client';

import { Container } from '@mui/material';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { paths } from 'src/routes/paths';
import { TariffEditForm } from '../tariff-edit-form';
import { useLocales } from 'src/locales';

export function TariffCreateView() {
  const { t } = useLocales();
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading={t('billing.tariffs.create.title')}
        description={t('billing.tariffs.create.description')}
        links={[
          { name: t('sidebar.app'), href: paths.dashboard.root },
          { name: t('sidebar.billing'), href: paths.dashboard.billing.root },
          { name: t('billing.tariffs.title'), href: paths.dashboard.billing.tariffs.root },
          { name: t('billing.tariffs.breadcrumbs.new') },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />
      <TariffEditForm />
    </Container>
  );
}
