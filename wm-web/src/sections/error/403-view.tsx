'use client';

import { m } from 'framer-motion';
// @mui
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
// layouts
import CompactLayout from 'src/layouts/compact';
// components
import { RouterLink } from 'src/routes/components';

// ----------------------------------------------------------------------

export default function View403() {
  return (
    <CompactLayout>
          <Typography variant="h3" sx={{ mb: 2 }}>
            No permission
          </Typography>

          <Typography sx={{ color: 'text.secondary' }}>
            The page you&apos;re trying access has restricted access.
            <br />
            Please refer to your system administrator
          </Typography>

        <Button component={RouterLink} href="/" size="large" variant="contained">
          Go to Home
        </Button>
    </CompactLayout>
  );
}
