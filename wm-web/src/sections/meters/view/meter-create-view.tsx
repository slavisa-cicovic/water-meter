'use client';

import { Container } from '@mui/material';
import { useSettingsContext } from 'src/components/settings';
import { MeterEditForm } from '../meter-edit-form';

export function MeterCreateView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <MeterEditForm />
    </Container>
  );
}

