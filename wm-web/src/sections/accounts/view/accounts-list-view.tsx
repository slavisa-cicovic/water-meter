'use client';

import React from 'react';
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
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { isEqual } from 'lodash';
import AccountTableToolbar from '../account-table-toolbar';
import AccountTableFiltersResult from '../account-table-filters-result';
import AccountTableRow from '../account-table-row';
import { useLocales } from 'src/locales';



const defaultFilters: IAccountTableFilters = {
  name: '',
  type: '',
  status: '',
};

export default function AccountsListView() {
  const { t } = useLocales();

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

  const TABLE_HEAD = [
    { id: 'avatar', label: '', width: 72, disableSort: true },
    { id: 'name', label: t('accounts.table.name'), width: 320 },
    { id: 'email', label: t('accounts.table.email'), minWidth: 620 },
    { id: 'type', label: t('accounts.table.type'), width: 120 },
    { id: 'verificationStatus', label: t('accounts.table.status'), width: 120 },
    { id: 'createdAt', label: t('accounts.table.created'), width: 120 },
    { id: '', label: t('accounts.table.actions'), align: 'right', width: 140, disableSort: true },
  ];

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading={t('accounts.title')}
        description={t('accounts.list.description')}
        links={[
          { name: t('sidebar.app'), href: paths.dashboard.root },
          { name: t('accounts.title'), href: paths.dashboard.accounts.root },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

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
            results={total}
            sx={{ p: 2.5, pt: 0 }}
          />
        )}
        <CardContent>

          {accountsError && (
            <EmptyContent
              filled
              title={t('accounts.list.loadError')}
              action={
                <Button
                  component={RouterLink}
                  href={paths.dashboard.root}
                  startIcon={<Iconify icon="eva:arrow-ios-back-fill" width={16} />}
                  sx={{ mt: 3 }}
                >
                  {t('accounts.list.backToDashboard')}
                </Button>
              }
              sx={{ py: 6 }}
            />
          )}

          {!accountsLoading && accountsEmpty && (
            <Alert severity="info">{t('accounts.list.empty')}</Alert>
          )}

          {!accountsLoading && !accountsError && accounts && accounts.length > 0 && (
            <TableContainer>
              <Table size="small" sx={{ minWidth: 960 }}>
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
                        <AccountTableSkeleton
                          key={index}
                          columns={TABLE_HEAD.map(el => el.width || el.minWidth || 100)}
                          sx={{ height: denseHeight }}
                        />
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
