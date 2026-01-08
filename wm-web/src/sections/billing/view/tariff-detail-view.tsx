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
import { useLocales } from 'src/locales';

type Props = {
  id: string;
};

export function TariffDetailView({ id }: Props) {
  const { t } = useLocales();
  const settings = useSettingsContext();
  const { tariff, tariffLoading, tariffError } = useGetTariff(id);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading={t('billing.tariffs.detail.title')}
        description={t('billing.tariffs.detail.description')}
        links={[
          { name: t('sidebar.app'), href: paths.dashboard.root },
          { name: t('sidebar.billing'), href: paths.dashboard.billing.root },
          { name: t('billing.tariffs.title'), href: paths.dashboard.billing.tariffs.root },
          { name: t('billing.tariffs.breadcrumbs.detail') },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      {tariffError && (
        <EmptyContent
          filled
          title={t('billing.tariffs.detail.loadError')}
          action={
            <Button
              component={RouterLink}
              href={paths.dashboard.billing.tariffs.root}
              startIcon={<Iconify icon="eva:arrow-ios-back-fill" width={16} />}
              sx={{ mt: 3 }}
            >
              {t('billing.tariffs.detail.backToTariffs')}
            </Button>
          }
          sx={{ py: 6 }}
        />
      )}

      {!tariffLoading && tariff && <TariffEditForm currentTariff={tariff} />}
    </Container>
  );
}
