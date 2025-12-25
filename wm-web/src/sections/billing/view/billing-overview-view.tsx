'use client';

import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  CardContent,
  Container,
  Table,
  TableBody,
  TableContainer,
  IconButton,
  Tooltip,
} from '@mui/material';
import { isEqual } from 'lodash';
import EmptyContent from 'src/components/empty-content';
import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';
import { TableHeadCustom, TableNoData, TablePaginationCustom, TableSelectedAction, useTable } from 'src/components/table';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { BillingApi, useGetInvoices } from 'src/api/billing';
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
  search: '',
  status: '',
  review: '',
  createdStart: defaultCreatedStart,
  createdEnd: defaultCreatedEnd,
};

const TABLE_HEAD = [
  { id: 'account', label: 'Account', minWidth: 200 },
  { id: 'meter', label: 'Meter', minWidth: 200 },
  { id: 'period', label: 'Period', minWidth: 200, disableSort: true },
  { id: 'createdAt', label: 'Created', width: 120 },
  { id: 'updatedAt', label: 'Updated', width: 120 },
  { id: 'consumption', label: 'Consumption', width: 120 },
  { id: 'totalAmount', label: 'Total', width: 140 },
  { id: 'status', label: 'Status', width: 120 },
  { id: '', label: 'Actions', align: 'right', width: 120, disableSort: true },
];

export function BillingOverviewView() {
  const settings = useSettingsContext();
  const [filters, setFilters] = useState(defaultFilters);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const table = useTable({ defaultRowsPerPage: 25, defaultDense: true, defaultOrderBy: 'createdAt', defaultOrder: 'desc' });

  const { invoices, invoicesLoading, invoicesError, invoicesEmpty, total, mutate } = useGetInvoices({
    search: filters.search || undefined,
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
  const selectableIds = invoices
    .filter((row) => row.status === 'draft' && (!row.reviewFlags || row.reviewFlags.length === 0))
    .map((row) => row.id);
  const sharedByMeterPeriod = useMemo(() => {
    const counts = new Map<string, number>();
    invoices.forEach((invoice) => {
      const key = `${invoice.meterId || ''}|${invoice.periodStart || ''}|${invoice.periodEnd || ''}`;
      counts.set(key, (counts.get(key) || 0) + 1);
    });
    return counts;
  }, [invoices]);

  const handleConfirmSelected = async () => {
    if (!table.selected.length) return;
    try {
      await BillingApi.confirmInvoices(table.selected as string[]);
      setConfirmOpen(false);
      table.setSelected([]);
      await mutate();
    } catch (error) {
      console.error(error);
    }
  };

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

  const handleOpenConfirm = () => {
    if (!table.selected.length) return;
    setConfirmOpen(true);
  };

  const handleCloseConfirm = () => {
    setConfirmOpen(false);
  };

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
            defaultFilters={defaultFilters}
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
            <TableContainer sx={{ position: 'relative' }}>
              <TableSelectedAction
                dense={table.dense}
                rowCount={selectableIds.length}
                numSelected={table.selected.length}
                onSelectAllRows={(checked) => table.onSelectAllRows(checked, selectableIds)}
                actions={[
                  {
                    key: 'confirm',
                    node: (
                      <Tooltip title="Confirm invoices" arrow>
                          <IconButton
                            color="primary"
                            onClick={handleOpenConfirm}
                            disabled={!table.selected.length}
                          >
                            <Iconify icon="eva:checkmark-circle-2-fill" />
                          </IconButton>
                      </Tooltip>
                    ),
                  },
                ]}
              />
              <Table size="small" sx={{ minWidth: 960 }}>
                <TableHeadCustom
                  order={table.order}
                  orderBy={table.orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={selectableIds.length}
                  numSelected={table.selected.length}
                  onSelectAllRows={(checked) => table.onSelectAllRows(checked, selectableIds)}
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
                    : invoices.map((row) => (
                      <BillingTableRow
                        key={row.id}
                        row={row}
                        selected={table.selected.includes(row.id)}
                        onSelectRow={() => table.onSelectRow(row.id)}
                        selectable={row.status === 'draft' && (!row.reviewFlags || row.reviewFlags.length === 0)}
                        onReviewed={mutate}
                        isShared={
                          (sharedByMeterPeriod.get(`${row.meterId || ''}|${row.periodStart || ''}|${row.periodEnd || ''}`) || 0) > 1
                        }
                      />
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

      <ConfirmDialog
        open={confirmOpen}
        onClose={handleCloseConfirm}
        title="Confirm invoices"
        content={`You are about to confirm ${table.selected.length} invoice(s). This action cannot be undone.`}
        action={
          <Button variant="contained" color="primary" onClick={handleConfirmSelected}>
            Confirm
          </Button>
        }
      />
    </Container>
  );
}
