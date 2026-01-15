'use client';

import React, { useCallback, useMemo, useState } from 'react';
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
} from '@mui/material';
import { isEqual, orderBy as lodashOrderBy } from 'lodash';
import { useSettingsContext } from 'src/components/settings';
import { TableHeadCustom, TableNoData, TablePaginationCustom, useTable } from 'src/components/table';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import EmptyContent from 'src/components/empty-content';
import Iconify from 'src/components/iconify';
import { useGetInvoiceLineItems } from 'src/api/billing';
import { useGetSettings } from 'src/api/settings';
import { RouterLink } from 'src/routes/components';
import { paths } from 'src/routes/paths';
import { InvoiceLineItem } from 'src/types/billings';
import { useLocales } from 'src/locales';
import { InvoiceLineItemTableFiltersResult } from '../invoice-line-item-table-filters-result';
import { InvoiceLineItemTableRow } from '../invoice-line-item-table-row';
import { InvoiceLineItemTableSkeleton } from '../invoice-line-item-skeleton';
import {
  InvoiceLineItemTableToolbar,
  IInvoiceLineItemTableFilters,
  IInvoiceLineItemTableFilterValue,
} from '../invoice-line-item-table-toolbar';

const defaultFilters: IInvoiceLineItemTableFilters = {
  search: '',
  type: '',
};

const filterLineItems = (lineItems: InvoiceLineItem[], filters: IInvoiceLineItemTableFilters) => {
  let data = lineItems;
  if (filters.search) {
    const search = filters.search.toLowerCase();
    data = data.filter((item) =>
      [item.name, item.description].some((value) => (value || '').toLowerCase().includes(search))
    );
  }
  if (filters.type) {
    const isPercentage = filters.type === 'percentage';
    data = data.filter((item) => item.isPercentage === isPercentage);
  }
  return data;
};

const sortLineItems = (lineItems: InvoiceLineItem[], orderBy: string, order: 'asc' | 'desc') => {
  const orderField =
    orderBy === 'name'
      ? 'name'
      : orderBy === 'type'
      ? 'isPercentage'
      : orderBy === 'value'
      ? 'value'
      : orderBy === 'sortOrder'
      ? 'sortOrder'
      : orderBy === 'updatedAt'
      ? 'updatedAt'
      : 'createdAt';
  return lodashOrderBy(lineItems, [orderField], [order]);
};

export function InvoiceLineItemListView() {
  const { t } = useLocales();
  const settings = useSettingsContext();
  const { settings: appSettings } = useGetSettings();
  const [filters, setFilters] = useState(defaultFilters);
  const table = useTable({ defaultRowsPerPage: 25, defaultDense: true, defaultOrderBy: 'createdAt', defaultOrder: 'desc' });
  const TABLE_HEAD = useMemo(
    () => [
      { id: 'name', label: t('billing.lineItems.table.name'), minWidth: 200 },
      { id: 'type', label: t('billing.lineItems.table.type'), width: 140 },
      { id: 'value', label: t('billing.lineItems.table.value'), width: 140 },
      { id: 'sortOrder', label: t('billing.lineItems.table.sortOrder'), width: 120 },
      { id: 'createdAt', label: t('billing.lineItems.table.created'), width: 120 },
      { id: 'updatedAt', label: t('billing.lineItems.table.updated'), width: 120 },
      { id: '', label: t('billing.lineItems.table.actions'), align: 'right', width: 120, disableSort: true },
    ],
    [t]
  );

  const { lineItems, lineItemsLoading, lineItemsError, lineItemsEmpty } = useGetInvoiceLineItems();

  const filteredLineItems = useMemo(() => filterLineItems(lineItems, filters), [lineItems, filters]);
  const sortedLineItems = useMemo(
    () => sortLineItems(filteredLineItems, table.orderBy, table.order),
    [filteredLineItems, table.orderBy, table.order]
  );

  const dataInPage = sortedLineItems.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const denseHeight = table.dense ? 60 : 80;
  const canReset = !isEqual(defaultFilters, filters);
  const notFound = (!sortedLineItems.length && canReset) || lineItemsEmpty;

  const handleFilters = useCallback(
    (name: string, value: IInvoiceLineItemTableFilterValue) => {
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
        heading={t('billing.lineItems.title')}
        description={t('billing.lineItems.description')}
        links={[
          { name: t('sidebar.app'), href: paths.dashboard.root },
          { name: t('sidebar.billing'), href: paths.dashboard.billing.root },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Stack direction="row" alignItems="center" justifyContent="flex-end" sx={{ mb: 3 }}>
        <Button variant="contained" component={RouterLink} href={paths.dashboard.billing.lineItems.new}>
          {t('billing.lineItems.actions.new')}
        </Button>
      </Stack>

      <Card>
        <InvoiceLineItemTableToolbar filters={filters} onFilters={handleFilters} />

        {canReset && (
          <InvoiceLineItemTableFiltersResult
            filters={filters}
            defaultFilters={defaultFilters}
            onFilters={handleFilters}
            onResetFilters={handleResetFilters}
            results={sortedLineItems.length}
            sx={{ p: 2.5, pt: 0 }}
          />
        )}

        <CardContent>
          {lineItemsError && (
            <EmptyContent
              filled
              title={t('billing.lineItems.loadError')}
              action={
                <Button
                  component={RouterLink}
                  href={paths.dashboard.root}
                  startIcon={<Iconify icon="eva:arrow-ios-back-fill" width={16} />}
                  sx={{ mt: 3 }}
                >
                  {t('billing.lineItems.backToDashboard')}
                </Button>
              }
              sx={{ py: 6 }}
            />
          )}

          {!lineItemsLoading && lineItemsEmpty && <Alert severity="info">{t('billing.lineItems.empty')}</Alert>}

          {!lineItemsLoading && !lineItemsError && lineItems && lineItems.length > 0 && (
            <TableContainer sx={{ position: 'relative' }}>
              <Table size="small" sx={{ minWidth: 720 }}>
                <TableHeadCustom
                  order={table.order}
                  orderBy={table.orderBy}
                  headLabel={TABLE_HEAD}
                  onSort={table.onSort}
                />
                <TableBody>
                  {lineItemsLoading
                    ? [...Array(table.rowsPerPage)].map((_i, index) => (
                      <InvoiceLineItemTableSkeleton
                        key={index}
                        columns={TABLE_HEAD.map((el) => el.width || el.minWidth || 100)}
                        sx={{ height: denseHeight }}
                      />
                    ))
                    : dataInPage.map((row) => (
                      <InvoiceLineItemTableRow key={row.id} row={row} currency={appSettings?.currency} />
                    ))}
                  <TableNoData notFound={notFound} />
                </TableBody>
              </Table>
            </TableContainer>
          )}

          <TablePaginationCustom
            count={sortedLineItems.length}
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
