'use client';

import { Button, Container } from '@mui/material';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import EmptyContent from 'src/components/empty-content';
import { useSettingsContext } from 'src/components/settings';
import { useGetInvoiceLineItem } from 'src/api/billing';
import { RouterLink } from 'src/routes/components';
import { paths } from 'src/routes/paths';
import { useLocales } from 'src/locales';
import { InvoiceLineItemEditForm } from '../invoice-line-item-edit-form';

type Props = {
  id: string;
};

export function InvoiceLineItemDetailView({ id }: Props) {
  const { t } = useLocales();
  const settings = useSettingsContext();
  const { lineItem, lineItemLoading, lineItemError } = useGetInvoiceLineItem(id);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading={t('billing.lineItems.detail.title')}
        description={t('billing.lineItems.detail.description')}
        links={[
          { name: t('sidebar.app'), href: paths.dashboard.root },
          { name: t('sidebar.billing'), href: paths.dashboard.billing.root },
          { name: t('billing.lineItems.title'), href: paths.dashboard.billing.lineItems.root },
          { name: t('billing.lineItems.breadcrumbs.detail') },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      {lineItemError && (
        <EmptyContent
          filled
          title={t('billing.lineItems.detail.loadError')}
          action={
            <Button
              component={RouterLink}
              href={paths.dashboard.billing.lineItems.root}
              sx={{ mt: 3 }}
            >
              {t('billing.lineItems.detail.backToLineItems')}
            </Button>
          }
          sx={{ py: 6 }}
        />
      )}

      {!lineItemLoading && lineItem && <InvoiceLineItemEditForm currentLineItem={lineItem} />}
    </Container>
  );
}
