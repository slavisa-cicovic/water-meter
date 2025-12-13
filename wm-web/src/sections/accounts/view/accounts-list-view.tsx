'use client';

// @mui
import {
  Alert,
  Button,
  Card,
  CardContent,
  Container,
  Stack,
  Table,
  TableBody,
  TableContainer,
  Typography,
} from '@mui/material';
import { AccountRow, IAccountTableFilters, IAccountTableFilterValue, VerificationStatus } from 'src/types/accounts';
import { AccountsApi, useGetAccounts } from 'src/api/accounts';
import EmptyContent from 'src/components/empty-content';
import Iconify from 'src/components/iconify';
import { RouterLink } from 'src/routes/components';
import { paths } from 'src/routes/paths';
import AccountTableSkeleton from '../account-skeleton';
import { useSettingsContext } from 'src/components/settings';
import { useCallback, useState } from 'react';
import { TableHeadCustom, TableNoData, TablePaginationCustom, useTable } from 'src/components/table';
import { isEqual } from 'lodash';
import AccountTableToolbar from '../account-table-toolbar';
import AccountTableFiltersResult from '../account-table-filters-result';
import AccountTableRow from '../account-table-row';



const defaultFilters: IAccountTableFilters = {
  name: '',
  type: '',
  status: '',
};

const TABLE_HEAD = [
  { id: 'name', label: 'name' },
  { id: 'email', label: 'owner' },
  { id: 'type', label: 'Type' },
  { id: 'verificationStatus', label: 'Status' },
  { id: 'createdAt', label: 'Created' },
  { id: '', label: 'Actions', align: 'right' },
];


export function AccountsListView() {

  const settings = useSettingsContext();
  const [filters, setFilters] = useState(defaultFilters);
  const table = useTable({ defaultRowsPerPage: 25, defaultDense: true, defaultOrderBy: 'createdAt', defaultOrder: 'desc' });

  const { accounts, accountsLoading, accountsError, mutate, accountsEmpty, total } = useGetAccounts({
    search: filters.name,
    type: filters.type || undefined,
    status: filters.status || undefined,
    orderBy: table.orderBy,
    order: table.order,
    page: table.page,
    pageSize: table.rowsPerPage,
  });

  const denseHeight = table.dense ? 60 : 80;

  const canReset = !isEqual(defaultFilters, filters);

  const notFound = (!accounts.length && canReset) || accountsEmpty;

  const handleFilters = useCallback(
    (name: string, value: IAccountTableFilterValue) => {
      table.onResetPage();
      setFilters((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    },
    [table],
  );

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const onVerify = useCallback(
    async (accountId: string, status: VerificationStatus) => {
      await AccountsApi.verify(accountId, status);
      mutate();
    },
    [mutate]
  );

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <Stack spacing={2} mb={3}>
        <Typography variant="h4">Accounts</Typography>
        <Typography variant="body2" color="text.secondary">
          Pending consumers and staff. Verify or reject to allow access.
        </Typography>
      </Stack>

      <Card>
        <AccountTableToolbar
          filters={filters}
          onFilters={handleFilters}
        />

        {canReset && (
          <AccountTableFiltersResult
            filters={filters}
            onFilters={handleFilters}
            //
            onResetFilters={handleResetFilters}
            //
            results={accounts.length}
            sx={{ p: 2.5, pt: 0 }}
          />
        )}
        <CardContent>

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
                <TableHeadCustom
                  order={table.order}
                  orderBy={table.orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={accounts.length}
                  numSelected={table.selected.length}
                  onSort={table.onSort}
                />
                <TableBody>
                  {accountsLoading
                    ? [...Array(table.rowsPerPage)].map((_i, index) => (
                        <AccountTableSkeleton key={index} sx={{ height: denseHeight }} />
                      ))
                    : accounts.map((row) => (
                        <AccountTableRow key={row.id} row={row} onVerify={(status: VerificationStatus) => onVerify(row.id, status)} />
                      ))}
                  <TableNoData notFound={notFound} />
                </TableBody>
              </Table>
            </TableContainer>
          )}
          <TablePaginationCustom
            count={total}
            page={table.page}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            onRowsPerPageChange={table.onChangeRowsPerPage}
            dense={table.dense}
            onChangeDense={table.onChangeDense}
          />
        </CardContent>
      </Card>
    </Container>
  );
}
