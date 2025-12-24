'use client';

import React, { useCallback, useState } from 'react';
import { Alert, Button, Card, CardContent, Container, Table, TableBody, TableContainer } from '@mui/material';
import { isEqual } from 'lodash';
import EmptyContent from 'src/components/empty-content';
import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';
import { TableHeadCustom, TableNoData, TablePaginationCustom, useTable } from 'src/components/table';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { useGetInvoices } from 'src/api/billing';
import { RouterLink } from 'src/routes/components';
import { paths } from 'src/routes/paths';
import { BillingTableFiltersResult } from '../billing-table-filters-result';
import { BillingTableRow } from '../billing-table-row';
import { BillingTableSkeleton } from '../billing-skeleton';
import { BillingTableToolbar, IBillingTableFilters, IBillingTableFilterValue } from '../billing-table-toolbar';

const getMonthBounds = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const toDate = (value: Date) => {
    const yyyy = value.getFullYear();
    const mm = String(value.getMonth() + 1).padStart(2, '0');
    const dd = String(value.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };
  return { start: toDate(start), end: toDate(end) };
};

const { start: defaultCreatedStart, end: defaultCreatedEnd } = getMonthBounds();

const defaultFilters: IBillingTableFilters = {
  accountId: '',
  meterId: '',
  status: '',
  review: '',
  createdStart: defaultCreatedStart,
  createdEnd: defaultCreatedEnd,
};

const TABLE_HEAD = [
  { id: 'account', label: 'Account', minWidth: 200 },
  { id: 'meter', label: 'Meter', minWidth: 200 },
  { id: 'period', label: 'Period', minWidth: 200, disableSort: true },
  { id: 'createdAt', label: 'Created', width: 160 },
  { id: 'updatedAt', label: 'Updated', width: 160 },
  { id: 'consumption', label: 'Consumption', width: 120 },
  { id: 'totalAmount', label: 'Total', width: 140 },
  { id: 'status', label: 'Status', width: 120 },
  { id: 'review', label: 'Review', width: 140, disableSort: true },
  { id: '', label: 'Actions', align: 'right', width: 120, disableSort: true },
];

export function BillingOverviewView() {
  const settings = useSettingsContext();
  const [filters, setFilters] = useState(defaultFilters);
  const table = useTable({ defaultRowsPerPage: 25, defaultDense: true, defaultOrderBy: 'createdAt', defaultOrder: 'desc' });

  const { invoices, invoicesLoading, invoicesError, invoicesEmpty, total } = useGetInvoices({
    accountId: filters.accountId || undefined,
    meterId: filters.meterId || undefined,
    status: filters.status || undefined,
    reviewFlags: filters.review ? [filters.review] : undefined,
    createdStart: filters.createdStart || undefined,
    createdEnd: filters.createdEnd || undefined,
    orderBy: table.orderBy,
    order: table.order,
    page: table.page,
    pageSize: table.rowsPerPage,
  });

  const denseHeight = table.dense ? 60 : 80;
  const canReset = !isEqual(defaultFilters, filters);
  const notFound = (!invoices.length && canReset) || invoicesEmpty;

  const handleFilters = useCallback(
    (name: string, value: IBillingTableFilterValue) => {
      table.onResetPage();
      setFilters((prevState) => ({ ...prevState, [name]: value }));
    },
    [table]
  );

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Billing Overview"
        description="Back-office billing overview with invoice status and totals."
        links={[
          { name: 'App', href: paths.dashboard.root },
          { name: 'Billing', href: paths.dashboard.billing.root },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card>
        <BillingTableToolbar filters={filters} onFilters={handleFilters} />

        {canReset && (
          <BillingTableFiltersResult
            filters={filters}
            onFilters={handleFilters}
            onResetFilters={handleResetFilters}
            results={total}
            sx={{ p: 2.5, pt: 0 }}
          />
        )}

        <CardContent>
          {invoicesError && (
            <EmptyContent
              filled
              title="Failed to load invoices."
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

          {!invoicesLoading && invoicesEmpty && <Alert severity="info">No invoices found.</Alert>}

          {!invoicesLoading && !invoicesError && invoices && invoices.length > 0 && (
            <TableContainer>
              <Table size="small" sx={{ minWidth: 960 }}>
                <TableHeadCustom
                  order={table.order}
                  orderBy={table.orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={invoices.length}
                  numSelected={table.selected.length}
                  onSort={table.onSort}
                />
                <TableBody>
                  {invoicesLoading
                    ? [...Array(table.rowsPerPage)].map((_i, index) => (
                        <BillingTableSkeleton
                          key={index}
                          columns={TABLE_HEAD.map((el) => el.width || el.minWidth || 100)}
                          sx={{ height: denseHeight }}
                        />
                      ))
                    : invoices.map((row) => <BillingTableRow key={row.id} row={row} />)}
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
