'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
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
import { useGetSettings } from 'src/api/settings';
import { RouterLink } from 'src/routes/components';
import { paths } from 'src/routes/paths';
import { useLocales } from 'src/locales';
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
  periodEndStart: '',
  periodEndEnd: '',
};

export function BillingOverviewView() {
  const { t } = useLocales();
  const settings = useSettingsContext();
  const { settings: appSettings } = useGetSettings();
  const searchParams = useSearchParams();
  const statusParam = searchParams.get('status') ?? '';
  const reviewParam = searchParams.get('review') ?? '';
  const [filters, setFilters] = useState<IBillingTableFilters>(() => ({
    ...defaultFilters,
    status: statusParam,
    review: reviewParam,
  }));
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const table = useTable({ defaultRowsPerPage: 25, defaultDense: true, defaultOrderBy: 'period', defaultOrder: 'desc' });
  const TABLE_HEAD = useMemo(
    () => [
      { id: 'account', label: t('billing.table.account'), minWidth: 200 },
      { id: 'meter', label: t('billing.table.meter'), minWidth: 200 },
      { id: 'period', label: t('billing.table.period'), minWidth: 200 },
      { id: 'createdAt', label: t('billing.table.created'), width: 120 },
      { id: 'updatedAt', label: t('billing.table.updated'), width: 120 },
      { id: 'consumption', label: t('billing.table.consumption'), width: 120, align: 'right' },
      { id: 'totalAmount', label: t('billing.table.total'), width: 140, align: 'right' },
      { id: 'status', label: t('billing.table.status'), width: 120 },
      { id: '', label: t('billing.table.actions'), align: 'right', width: 120, disableSort: true },
    ],
    [t]
  );

  useEffect(() => {
    setFilters((prev) => {
      if (prev.status === statusParam && prev.review === reviewParam) return prev;
      return { ...prev, status: statusParam, review: reviewParam };
    });
    table.onResetPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reviewParam, statusParam]);

  const { invoices, invoicesLoading, invoicesError, invoicesEmpty, total, mutate } = useGetInvoices({
    search: filters.search || undefined,
    status: filters.status || undefined,
    reviewFlags: filters.review ? [filters.review] : undefined,
    createdStart: filters.createdStart || undefined,
    createdEnd: filters.createdEnd || undefined,
    periodEndStart: filters.periodEndStart || undefined,
    periodEndEnd: filters.periodEndEnd || undefined,
    orderBy: table.orderBy,
    order: table.order,
    page: table.page,
    pageSize: table.rowsPerPage,
  });

  const denseHeight = table.dense ? 60 : 80;
  const canReset = !isEqual(defaultFilters, filters);
  const notFound = (!invoices.length && canReset) || invoicesEmpty;
  const confirmableIds = invoices
    .filter((row) => row.status === 'draft' && (!row.reviewFlags || row.reviewFlags.length === 0))
    .map((row) => row.id);
  const cancellableIds = invoices.filter((row) => row.status === 'draft' || row.status === 'issued').map((row) => row.id);
  const selectedIds = table.selected.map((selectedId) => String(selectedId));
  const canConfirmSelection =
    selectedIds.length > 0 && selectedIds.every((selectedId) => confirmableIds.includes(selectedId));
  const canCancelSelection =
    selectedIds.length > 0 && selectedIds.every((selectedId) => cancellableIds.includes(selectedId));
  const sharedByMeterPeriod = useMemo(() => {
    const counts = new Map<string, number>();
    invoices.forEach((invoice) => {
      const key = `${invoice.meterId || ''}|${invoice.periodStart || ''}|${invoice.periodEnd || ''}`;
      counts.set(key, (counts.get(key) || 0) + 1);
    });
    return counts;
  }, [invoices]);

  const handleConfirmSelected = async () => {
    if (!canConfirmSelection) return;
    try {
      await BillingApi.confirmInvoices(table.selected as string[]);
      setConfirmOpen(false);
      table.setSelected([]);
      await mutate();
    } catch (error) {
      console.error(error);
    }
  };

  const handleCancelSelected = async () => {
    if (!canCancelSelection) return;
    try {
      await BillingApi.cancelInvoices(table.selected as string[]);
      setCancelOpen(false);
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
    if (!canConfirmSelection) return;
    setConfirmOpen(true);
  };

  const handleOpenCancel = () => {
    if (!canCancelSelection) return;
    setCancelOpen(true);
  };

  const handleCloseConfirm = () => {
    setConfirmOpen(false);
  };

  const handleCloseCancel = () => {
    setCancelOpen(false);
  };

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading={t('billing.overview.title')}
        description={t('billing.overview.description')}
        links={[
          { name: t('sidebar.app'), href: paths.dashboard.root },
          { name: t('sidebar.billing'), href: paths.dashboard.billing.root },
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
              title={t('billing.overview.loadError')}
              action={
                <Button
                  component={RouterLink}
                  href={paths.dashboard.root}
                  startIcon={<Iconify icon="eva:arrow-ios-back-fill" width={16} />}
                  sx={{ mt: 3 }}
                >
                  {t('billing.overview.backToDashboard')}
                </Button>
              }
              sx={{ py: 6 }}
            />
          )}

          {!invoicesLoading && invoicesEmpty && <Alert severity="info">{t('billing.overview.empty')}</Alert>}

          {!invoicesLoading && !invoicesError && invoices && invoices.length > 0 && (
            <TableContainer sx={{ position: 'relative' }}>
              <TableSelectedAction
                dense={table.dense}
                rowCount={cancellableIds.length}
                numSelected={table.selected.length}
                onSelectAllRows={(checked) => table.onSelectAllRows(checked, cancellableIds)}
                actions={[
                  {
                    key: 'confirm',
                    node: (
                      <Tooltip title={t('billing.actions.confirmInvoices')} arrow>
                        <IconButton
                          color="primary"
                          onClick={handleOpenConfirm}
                          disabled={!canConfirmSelection}
                        >
                          <Iconify icon="eva:checkmark-circle-2-fill" />
                        </IconButton>
                      </Tooltip>
                    ),
                  },
                  {
                    key: 'cancel',
                    node: (
                      <Tooltip title={t('billing.actions.cancelInvoices')} arrow>
                        <IconButton
                          color="error"
                          onClick={handleOpenCancel}
                          disabled={!canCancelSelection}
                        >
                          <Iconify icon="eva:close-circle-fill" />
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
                  rowCount={cancellableIds.length}
                  numSelected={table.selected.length}
                  onSelectAllRows={(checked) => table.onSelectAllRows(checked, cancellableIds)}
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
                        selectable={row.status === 'draft' || row.status === 'issued'}
                        onReviewed={mutate}
                        isShared={
                          (sharedByMeterPeriod.get(`${row.meterId || ''}|${row.periodStart || ''}|${row.periodEnd || ''}`) || 0) > 1
                        }
                        currency={appSettings?.currency}
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
        title={t('billing.confirm.title')}
        content={t('billing.confirm.body', { count: table.selected.length })}
        action={
          <Button variant="contained" color="primary" onClick={handleConfirmSelected}>
            {t('billing.actions.confirm')}
          </Button>
        }
      />
      <ConfirmDialog
        open={cancelOpen}
        onClose={handleCloseCancel}
        title={t('billing.cancel.title')}
        content={t('billing.cancel.body', { count: table.selected.length })}
        action={
          <Button variant="contained" color="error" onClick={handleCancelSelected}>
            {t('billing.actions.cancel')}
          </Button>
        }
      />
    </Container>
  );
}
