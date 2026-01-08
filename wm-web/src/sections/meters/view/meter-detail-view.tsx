'use client';

import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
import { useGetMeter } from 'src/api/meters';
import { useSettingsContext } from 'src/components/settings';
import EmptyContent from 'src/components/empty-content';
import Iconify from 'src/components/iconify';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { useLocales } from 'src/locales';
import { MeterEditForm } from '../meter-edit-form';

type Props = {
  id: string;
};

export function MeterDetailView({ id }: Props) {
  const settings = useSettingsContext();
  const { t } = useLocales();
  const { meter, meterLoading, meterError } = useGetMeter(id);

  const renderError = (
    <EmptyContent
      filled
      title={t('meters.detail.notFound', { id })}
      action={
        <Button
          component={RouterLink}
          href={paths.dashboard.meters.root}
          startIcon={<Iconify icon="eva:arrow-ios-back-fill" width={16} />}
          sx={{ mt: 3 }}
        >
          {t('meters.actions.back')}
        </Button>
      }
      sx={{ py: 10 }}
    />
  );

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading={meter?.serialNumber ? t('meters.detail.titleWithSerial', { serial: meter.serialNumber }) : t('meters.title')}
        description={t('meters.detail.description')}
        links={[
          { name: t('sidebar.app'), href: paths.dashboard.root },
          { name: t('meters.title'), href: paths.dashboard.meters.root },
          { name: t('meters.detail.breadcrumbs.details') },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />
      {meterLoading && null}
      {meterError && renderError}
      {meter && <MeterEditForm currentMeter={meter} />}
    </Container>
  );
}
