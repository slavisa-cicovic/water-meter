'use client';

import { Container } from '@mui/material';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { useSettingsContext } from 'src/components/settings';
import { paths } from 'src/routes/paths';
import { useLocales } from 'src/locales';
import { InvoiceLineItemEditForm } from '../invoice-line-item-edit-form';

export function InvoiceLineItemCreateView() {
  const { t } = useLocales();
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading={t('billing.lineItems.create.title')}
        description={t('billing.lineItems.create.description')}
        links={[
          { name: t('sidebar.app'), href: paths.dashboard.root },
          { name: t('sidebar.billing'), href: paths.dashboard.billing.root },
          { name: t('billing.lineItems.title'), href: paths.dashboard.billing.lineItems.root },
          { name: t('billing.lineItems.breadcrumbs.new') },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <InvoiceLineItemEditForm />
    </Container>
  );
}
