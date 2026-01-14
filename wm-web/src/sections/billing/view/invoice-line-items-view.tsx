'use client';

import { Card, CardContent, Container, Typography } from '@mui/material';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { useSettingsContext } from 'src/components/settings';
import { useLocales } from 'src/locales';
import { paths } from 'src/routes/paths';

export function InvoiceLineItemsView() {
  const { t } = useLocales();
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading={t('billing.lineItems.title', { defaultValue: 'Invoice Line Items' })}
        description={t('billing.lineItems.description', {
          defaultValue: 'Manage invoice line items such as fees, VAT, and consumption rules.',
        })}
        links={[
          { name: t('sidebar.app'), href: paths.dashboard.root },
          { name: t('sidebar.billing'), href: paths.dashboard.billing.root },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card>
        <CardContent>
          <Typography variant="body1">
            {t('billing.lineItems.placeholder', {
              defaultValue: 'This section is planned and will be implemented next.',
            })}
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
}
