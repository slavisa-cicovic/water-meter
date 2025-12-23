'use client';

import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
import { useGetMeter } from 'src/api/meters';
import { useSettingsContext } from 'src/components/settings';
import EmptyContent from 'src/components/empty-content';
import Iconify from 'src/components/iconify';
import { MeterEditForm } from '../meter-edit-form';

type Props = {
  id: string;
};

export function MeterDetailView({ id }: Props) {
  const settings = useSettingsContext();
  const { meter, meterLoading, meterError } = useGetMeter(id);

  const renderError = (
    <EmptyContent
      filled
      title={`Error, not found ${id}`}
      action={
        <Button
          component={RouterLink}
          href={paths.dashboard.meters.root}
          startIcon={<Iconify icon="eva:arrow-ios-back-fill" width={16} />}
          sx={{ mt: 3 }}
        >
          Back
        </Button>
      }
      sx={{ py: 10 }}
    />
  );

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      {meterLoading && null}
      {meterError && renderError}
      {meter && <MeterEditForm currentMeter={meter} />}
    </Container>
  );
}

