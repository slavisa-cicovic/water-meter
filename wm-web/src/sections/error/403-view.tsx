'use client';
// @mui
import Button from '@mui/material/Button';
// layouts
import CompactLayout from 'src/layouts/compact';
// components
import { RouterLink } from 'src/routes/components';
import PermissionDenied from 'src/components/permission-denied';

// ----------------------------------------------------------------------

export default function View403() {
  return (
    <CompactLayout>
      <PermissionDenied
        title="No permission"
        message="The page you're trying access has restricted access.\nPlease refer to your system administrator"
        sx={{ py: 6 }}
      />
      <Button component={RouterLink} href="/" size="large" variant="contained">
        Go to Home
      </Button>
    </CompactLayout>
  );
}
