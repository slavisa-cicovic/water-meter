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

export default function Page500() {
  return (
    <CompactLayout>
          <Typography variant="h3" sx={{ mb: 2 }}>
            500 Internal Server Error
          </Typography>
          <Typography sx={{ color: 'text.secondary' }}>
            There was an error, please try again later.
          </Typography>

        <Button component={RouterLink} href="/" size="large" variant="contained">
          Go to Home
        </Button>
    </CompactLayout>
  );
}
