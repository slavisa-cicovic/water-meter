'use client';

import { Alert, Container } from '@mui/material';
import { useSettingsContext } from 'src/components/settings';
import { useGetInvoice } from 'src/api/billing';
import { useGetSettings } from 'src/api/settings';
import EmptyContent from 'src/components/empty-content';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { paths } from 'src/routes/paths';
import { useLocales } from 'src/locales';
import { InvoiceEditForm } from '../invoice-edit-form';

type Props = {
  id: string;
};

export function InvoiceDetailView({ id }: Props) {
  const { t } = useLocales();
  const settings = useSettingsContext();
  const { invoice, invoiceLoading, invoiceError, mutate } = useGetInvoice(id);
  const { settings: appSettings } = useGetSettings();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading={t('billing.invoice.title')}
        description={t('billing.invoice.description')}
        links={[
          { name: t('sidebar.app'), href: paths.dashboard.root },
          { name: t('sidebar.billing'), href: paths.dashboard.billing.root },
          {
            name: invoice?.account
              ? `${invoice.account.firstName} ${invoice.account.lastName}`
              : id,
          },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      {invoiceError && <EmptyContent filled title={t('billing.invoice.loadError')} sx={{ py: 6 }} />}
      {invoiceLoading && <Alert severity="info">{t('billing.invoice.loading')}</Alert>}

      {invoice && (
        <InvoiceEditForm invoice={invoice} currency={appSettings?.currency} onUpdated={mutate} />
      )}
    </Container>
  );
}
