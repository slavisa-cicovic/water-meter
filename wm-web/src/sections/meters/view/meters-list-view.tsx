'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { Alert, Button, Card, CardContent, Container, Table, TableBody, TableContainer } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { isEqual } from 'lodash';
import EmptyContent from 'src/components/empty-content';
import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';
import { TableHeadCustom, TableNoData, TablePaginationCustom, useTable } from 'src/components/table';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { useGetMeters } from 'src/api/meters';
import { RouterLink } from 'src/routes/components';
import { paths } from 'src/routes/paths';
import { useAuthContext } from 'src/auth/hooks';
import { PERMISSIONS } from 'src/constants/permissions';
import { useLocales } from 'src/locales';
import { MeterTableFiltersResult } from '../meter-table-filters-result';
import { MeterTableRow } from '../meter-table-row';
import { MeterTableSkeleton } from '../meter-skeleton';
import { MeterTableToolbar, IMeterTableFilters, IMeterTableFilterValue } from '../meter-table-toolbar';

const defaultFilters: IMeterTableFilters = {
  search: '',
  status: '',
  groupCode: '',
  type: '',
  review: '',
};

export function MetersListView() {
  const settings = useSettingsContext();
  const theme = useTheme();
  const { t } = useLocales();
  const { user } = useAuthContext();
  const currentPermissions = (user as any)?.permissions as string[] | undefined;
  const showReviewColumn = currentPermissions?.includes(PERMISSIONS.READINGS_UPDATE) ?? false;
  const [filters, setFilters] = useState(defaultFilters);
  const table = useTable({ defaultRowsPerPage: 25, defaultDense: true, defaultOrderBy: 'createdAt', defaultOrder: 'desc' });
  const baseTableHead = useMemo(
    () => [
      { id: 'serialNumber', label: t('meters.table.serial'), width: 220 },
      { id: 'groupCode', label: t('meters.table.group'), width: 120 },
      { id: 'address', label: t('meters.table.address'), minWidth: 420 },
      { id: 'type', label: t('meters.table.type'), width: 140 },
      { id: 'status', label: t('meters.table.status'), width: 120 },
      { id: 'consumersCount', label: t('meters.table.consumers'), width: 120, disableSort: true },
      { id: 'createdAt', label: t('meters.table.created'), width: 160 },
      { id: '', label: t('meters.table.actions'), align: 'right', width: 140, disableSort: true },
    ],
    [t]
  );

  const tableHead = useMemo(() => {
    if (!showReviewColumn) return baseTableHead;
    const reviewColumn = {
      id: 'barcodeReview',
      label: t('meters.table.review'),
      width: 120,
      disableSort: true,
    };
    const next = baseTableHead.slice();
    next.splice(next.length - 1, 0, reviewColumn);
    return next;
  }, [baseTableHead, showReviewColumn, t]);

  const { meters, metersLoading, metersError, metersEmpty, total } = useGetMeters({
    search: filters.search,
    status: filters.status || undefined,
    groupCode: filters.groupCode || undefined,
    type: filters.type || undefined,
    review: filters.review || undefined,
    orderBy: table.orderBy,
    order: table.order,
    page: table.page,
    pageSize: table.rowsPerPage,
  });

  const denseHeight = table.dense ? 60 : 80;

  const canReset = !isEqual(defaultFilters, filters);
  const notFound = (!meters.length && canReset) || metersEmpty;

  const handleFilters = useCallback(
    (name: string, value: IMeterTableFilterValue) => {
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
        heading={t('meters.title')}
        description={t('meters.list.description')}
        links={[
          { name: t('sidebar.app'), href: paths.dashboard.root },
          { name: t('meters.title'), href: paths.dashboard.meters.root },
        ]}
        action={
          <Button
            component={RouterLink}
            href={paths.dashboard.meters.new}
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" width={16} />}
            sx={{
              minWidth: '100px',
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
                borderColor: theme.palette.primary.dark,
              },
            }}
          >
            {t('meters.actions.new')}
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card>
        <MeterTableToolbar
          filters={filters}
          onFilters={handleFilters}
          showReviewFilter={showReviewColumn}
        />

        {canReset && (
          <MeterTableFiltersResult
            filters={filters}
            onFilters={handleFilters}
            onResetFilters={handleResetFilters}
            results={total}
            sx={{ p: 2.5, pt: 0 }}
          />
        )}

        <CardContent>
          {metersError && (
            <EmptyContent
              filled
              title={t('meters.list.loadError')}
              action={
                <Button
                  component={RouterLink}
                  href={paths.dashboard.root}
                  startIcon={<Iconify icon="eva:arrow-ios-back-fill" width={16} />}
                  sx={{ mt: 3 }}
                >
                  {t('meters.list.backToDashboard')}
                </Button>
              }
              sx={{ py: 6 }}
            />
          )}

          {!metersLoading && metersEmpty && (
            <Alert severity="info">{t('meters.list.empty')}</Alert>
          )}

          {!metersLoading && !metersError && meters && meters.length > 0 && (
            <TableContainer>
              <Table size="small" sx={{ minWidth: 960 }}>
                <TableHeadCustom
                  order={table.order}
                  orderBy={table.orderBy}
                  headLabel={tableHead}
                  rowCount={meters.length}
                  numSelected={table.selected.length}
                  onSort={table.onSort}
                />
                <TableBody>
                  {metersLoading
                    ? [...Array(table.rowsPerPage)].map((_i, index) => (
                        <MeterTableSkeleton
                          key={index}
                          columns={tableHead.map((el) => el.width || el.minWidth || 100)}
                          sx={{ height: denseHeight }}
                        />
                      ))
                    : meters.map((row) => (
                        <MeterTableRow
                          key={row.id}
                          row={{
                            ...row,
                          }}
                          showReviewColumn={showReviewColumn}
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
    </Container>
  );
}
