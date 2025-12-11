'use client';

// @mui
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { VerificationStatus } from 'src/types/accounts';
import { AccountsApi, useGetAccounts } from 'src/api/accounts';
import { TableSkeleton } from 'src/components/table';
import EmptyContent from 'src/components/empty-content';
import Iconify from 'src/components/iconify';
import { RouterLink } from 'src/routes/components';
import { paths } from 'src/routes/paths';

const statusColor: Record<VerificationStatus, 'warning' | 'success' | 'error'> = {
  pending: 'warning',
  verified: 'success',
  rejected: 'error',
};

export function AccountsListView() {
  const { accounts, accountsLoading, accountsError, mutate, accountsEmpty } = useGetAccounts();

  const onVerify = async (accountId: string, status: VerificationStatus) => {
    await AccountsApi.verify(accountId, status);
    mutate();
  };

  return (
    <Box>
      <Stack spacing={2} mb={3}>
        <Typography variant="h4">Accounts</Typography>
        <Typography variant="body2" color="text.secondary">
          Pending consumers and staff. Verify or reject to allow access.
        </Typography>
      </Stack>

      <Card>
        <CardContent>
          {accountsLoading && <TableSkeleton />}

          {accountsError && (
            <EmptyContent
              filled
              title="Failed to load accounts."
              action={
                <Button
                  component={RouterLink}
                  href={paths.dashboard.root}
                  startIcon={<Iconify icon="eva:arrow-ios-back-fill" width={16} />}
                  sx={{ mt: 3 }}
                >
                  Back to dashboard
                </Button>
              }
              sx={{ py: 6 }}
            />
          )}

          {!accountsLoading && accountsEmpty && <Alert severity="info">No accounts found.</Alert>}

          {!accountsLoading && !accountsError && accounts && accounts.length > 0 && (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {accounts.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        <Stack spacing={0.5}>
                          <Typography variant="subtitle2">
                            {row.data.firstName} {row.data.lastName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {row.data.address}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>{row.data.email}</TableCell>
                      <TableCell sx={{ textTransform: 'capitalize' }}>{row.type}</TableCell>
                      <TableCell>
                        <Chip label={row.verificationStatus} color={statusColor[row.verificationStatus]} size="small" />
                      </TableCell>
                      <TableCell>{row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '-'}</TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Button
                            size="small"
                            variant="outlined"
                            color="success"
                            disabled={row.verificationStatus === 'verified'}
                            onClick={() => onVerify(row.id, 'verified')}
                          >
                            Verify
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            disabled={row.verificationStatus === 'rejected'}
                            onClick={() => onVerify(row.id, 'rejected')}
                          >
                            Reject
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
