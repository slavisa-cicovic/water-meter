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
  Stack,
} from '@mui/material';
import { isEqual, orderBy as lodashOrderBy } from 'lodash';
import { useSettingsContext } from 'src/components/settings';
import { TableHeadCustom, TableNoData, TablePaginationCustom, TableSelectedAction, useTable } from 'src/components/table';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import EmptyContent from 'src/components/empty-content';
import Iconify from 'src/components/iconify';
import { TariffsApi, useGetTariffs } from 'src/api/billing';
import { useGetSettings } from 'src/api/settings';
import { RouterLink } from 'src/routes/components';
import { paths } from 'src/routes/paths';
import { Tariff } from 'src/types/billings';
import { TariffTableFiltersResult } from '../tariff-table-filters-result';
import { TariffTableRow } from '../tariff-table-row';
import { TariffTableSkeleton } from '../tariff-skeleton';
import { TariffTableToolbar, ITariffTableFilters, ITariffTableFilterValue } from '../tariff-table-toolbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useLocales } from 'src/locales';

const defaultFilters: ITariffTableFilters = {
  search: '',
  status: '',
};

const filterTariffs = (tariffs: Tariff[], filters: ITariffTableFilters) => {
  let data = tariffs;
  if (filters.search) {
    const search = filters.search.toLowerCase();
    data = data.filter((tariff) =>
      [tariff.name, tariff.groupCode].some((value) => (value || '').toLowerCase().includes(search))
    );
  }
  if (filters.status) {
    data = data.filter((tariff) => tariff.status === filters.status);
  }
  return data;
};

const sortTariffs = (tariffs: Tariff[], orderBy: string, order: 'asc' | 'desc') => {
  const orderField =
    orderBy === 'name'
      ? 'name'
      : orderBy === 'basePrice'
      ? 'basePrice'
      : orderBy === 'validFrom'
      ? 'validFrom'
      : orderBy === 'validTo'
      ? 'validTo'
      : orderBy === 'status'
      ? 'status'
      : 'createdAt';
  return lodashOrderBy(tariffs, [orderField], [order]);
};

export function TariffListView() {
  const { t } = useLocales();
  const settings = useSettingsContext();
  const { settings: appSettings } = useGetSettings();
  const [filters, setFilters] = useState(defaultFilters);
  const [confirmAction, setConfirmAction] = useState<'delete' | 'activate' | 'deactivate' | null>(null);
  const table = useTable({ defaultRowsPerPage: 25, defaultDense: true, defaultOrderBy: 'name', defaultOrder: 'asc' });
  const TABLE_HEAD = useMemo(
    () => [
      { id: 'name', label: t('billing.tariffs.table.name'), minWidth: 200 },
      { id: 'basePrice', label: t('billing.tariffs.table.basePrice'), width: 120 },
      { id: 'limits', label: t('billing.tariffs.table.limits'), width: 160, disableSort: true },
      { id: 'multipliers', label: t('billing.tariffs.table.multipliers'), width: 160, disableSort: true },
      { id: 'validFrom', label: t('billing.tariffs.table.validFrom'), width: 120 },
      { id: 'validTo', label: t('billing.tariffs.table.validTo'), width: 120 },
      { id: 'status', label: t('billing.tariffs.table.status'), width: 80 },
      { id: '', label: t('billing.tariffs.table.actions'), align: 'right', width: 80, disableSort: true },
    ],
    [t]
  );

  const { tariffs, tariffsLoading, tariffsError, tariffsEmpty, mutate } = useGetTariffs();

  const filteredTariffs = useMemo(() => filterTariffs(tariffs, filters), [tariffs, filters]);
  const sortedTariffs = useMemo(
    () => sortTariffs(filteredTariffs, table.orderBy, table.order),
    [filteredTariffs, table.orderBy, table.order]
  );

  const dataInPage = sortedTariffs.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const denseHeight = table.dense ? 60 : 80;
  const canReset = !isEqual(defaultFilters, filters);
  const notFound = (!sortedTariffs.length && canReset) || tariffsEmpty;
  const selectableIds = dataInPage.map((row) => row.id);

  const selectedTariffs = useMemo(
    () => tariffs.filter((tariff) => table.selected.includes(tariff.id)),
    [tariffs, table.selected]
  );
  const canActivate = selectedTariffs.some((tariff) => tariff.status !== 'active');
  const canDeactivate = selectedTariffs.some((tariff) => tariff.status === 'active');
  const actionLabels: Record<'delete' | 'activate' | 'deactivate', string> = {
    delete: t('billing.tariffs.actionVerbs.delete'),
    activate: t('billing.tariffs.actionVerbs.activate'),
    deactivate: t('billing.tariffs.actionVerbs.deactivate'),
  };

  const handleFilters = useCallback(
    (name: string, value: ITariffTableFilterValue) => {
      table.onResetPage();
      setFilters((prevState) => ({ ...prevState, [name]: value }));
    },
    [table]
  );

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const handleOpenConfirm = (action: 'delete' | 'activate' | 'deactivate') => {
    if (!table.selected.length) return;
    setConfirmAction(action);
  };

  const handleCloseConfirm = () => {
    setConfirmAction(null);
  };

  const handleConfirmAction = async () => {
    if (!confirmAction) return;
    await TariffsApi.bulkUpdate(table.selected as string[], confirmAction);
    table.setSelected([]);
    setConfirmAction(null);
    await mutate();
  };

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading={t('billing.tariffs.title')}
        description={t('billing.tariffs.description')}
        links={[
          { name: t('sidebar.app'), href: paths.dashboard.root },
          { name: t('sidebar.billing'), href: paths.dashboard.billing.root },
          { name: t('billing.tariffs.title'), href: paths.dashboard.billing.tariffs.root },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Stack direction="row" alignItems="center" justifyContent="flex-end" sx={{ mb: 3 }}>
        <Button variant="contained" component={RouterLink} href={paths.dashboard.billing.tariffs.new}>
          {t('billing.tariffs.actions.new')}
        </Button>
      </Stack>

      <Card>
        <TariffTableToolbar filters={filters} onFilters={handleFilters} />

        {canReset && (
          <TariffTableFiltersResult
            filters={filters}
            onFilters={handleFilters}
            onResetFilters={handleResetFilters}
            results={sortedTariffs.length}
            sx={{ p: 2.5, pt: 0 }}
          />
        )}

        <CardContent>
          {tariffsError && (
            <EmptyContent
              filled
              title={t('billing.tariffs.loadError')}
              action={
                <Button
                  component={RouterLink}
                  href={paths.dashboard.root}
                  startIcon={<Iconify icon="eva:arrow-ios-back-fill" width={16} />}
                  sx={{ mt: 3 }}
                >
                  {t('billing.tariffs.backToDashboard')}
                </Button>
              }
              sx={{ py: 6 }}
            />
          )}

          {!tariffsLoading && tariffsEmpty && <Alert severity="info">{t('billing.tariffs.empty')}</Alert>}

          {!tariffsLoading && !tariffsError && tariffs && tariffs.length > 0 && (
            <TableContainer sx={{ position: 'relative' }}>
              <TableSelectedAction
                dense={table.dense}
                rowCount={selectableIds.length}
                numSelected={table.selected.length}
                onSelectAllRows={(checked) => table.onSelectAllRows(checked, selectableIds)}
                actions={[
                  {
                    key: 'activate',
                    node: (
                      <Tooltip title={t('billing.tariffs.actions.activate')} arrow>
                        <span>
                          <IconButton
                            color="success"
                            onClick={() => handleOpenConfirm('activate')}
                            disabled={!canActivate}
                          >
                            <Iconify icon="eva:checkmark-circle-2-fill" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    ),
                  },
                  {
                    key: 'deactivate',
                    node: (
                      <Tooltip title={t('billing.tariffs.actions.deactivate')} arrow>
                        <span>
                          <IconButton
                            color="warning"
                            onClick={() => handleOpenConfirm('deactivate')}
                            disabled={!canDeactivate}
                          >
                            <Iconify icon="eva:slash-outline" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    ),
                  },
                  {
                    key: 'delete',
                    node: (
                      <Tooltip title={t('billing.tariffs.actions.delete')} arrow>
                        <span>
                          <IconButton color="error" onClick={() => handleOpenConfirm('delete')}>
                            <Iconify icon="eva:trash-2-outline" />
                          </IconButton>
                        </span>
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
                  {tariffsLoading
                    ? [...Array(table.rowsPerPage)].map((_i, index) => (
                        <TariffTableSkeleton
                          key={index}
                          columns={TABLE_HEAD.map((el) => el.width || el.minWidth || 100)}
                          sx={{ height: denseHeight }}
                        />
                      ))
                    : dataInPage.map((row) => (
                        <TariffTableRow
                          key={row.id}
                          row={row}
                          selected={table.selected.includes(row.id)}
                          onSelectRow={() => table.onSelectRow(row.id)}
                          currency={appSettings?.currency}
                        />
                      ))}
                  <TableNoData notFound={notFound} />
                </TableBody>
              </Table>
            </TableContainer>
          )}

          <TablePaginationCustom
            count={sortedTariffs.length}
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
        open={Boolean(confirmAction)}
        onClose={handleCloseConfirm}
        title={t('billing.tariffs.confirm.title')}
        content={
          confirmAction
            ? t('billing.tariffs.confirm.body', { action: actionLabels[confirmAction], count: table.selected.length })
            : ''
        }
        action={
          <Button variant="contained" color="primary" onClick={handleConfirmAction}>
            {t('billing.tariffs.confirm.confirm')}
          </Button>
        }
      />
    </Container>
  );
}
