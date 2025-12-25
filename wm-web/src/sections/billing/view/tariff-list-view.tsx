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
import { RouterLink } from 'src/routes/components';
import { paths } from 'src/routes/paths';
import { Tariff } from 'src/types/billings';
import { TariffTableFiltersResult } from '../tariff-table-filters-result';
import { TariffTableRow } from '../tariff-table-row';
import { TariffTableSkeleton } from '../tariff-skeleton';
import { TariffTableToolbar, ITariffTableFilters, ITariffTableFilterValue } from '../tariff-table-toolbar';
import { ConfirmDialog } from 'src/components/custom-dialog';

const defaultFilters: ITariffTableFilters = {
  search: '',
  status: '',
};

const TABLE_HEAD = [
  { id: 'name', label: 'Name', minWidth: 200 },
  { id: 'basePrice', label: 'Base price', width: 120 },
  { id: 'limits', label: 'Limits', width: 160, disableSort: true },
  { id: 'multipliers', label: 'Multipliers', width: 160, disableSort: true },
  { id: 'validFrom', label: 'Valid from', width: 120 },
  { id: 'validTo', label: 'Valid to', width: 120 },
  { id: 'status', label: 'Status', width: 80 },
  { id: '', label: 'Actions', align: 'right', width: 80, disableSort: true },
];

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
  const settings = useSettingsContext();
  const [filters, setFilters] = useState(defaultFilters);
  const [confirmAction, setConfirmAction] = useState<'delete' | 'activate' | 'deactivate' | null>(null);
  const table = useTable({ defaultRowsPerPage: 25, defaultDense: true, defaultOrderBy: 'name', defaultOrder: 'asc' });

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
        heading="Tariffs"
        description="Manage tariff definitions and activation state."
        links={[
          { name: 'App', href: paths.dashboard.root },
          { name: 'Billing', href: paths.dashboard.billing.root },
          { name: 'Tariffs', href: paths.dashboard.billing.tariffs.root },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Stack direction="row" alignItems="center" justifyContent="flex-end" sx={{ mb: 3 }}>
        <Button variant="contained" component={RouterLink} href={paths.dashboard.billing.tariffs.new}>
          New tariff
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
              title="Failed to load tariffs."
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

          {!tariffsLoading && tariffsEmpty && <Alert severity="info">No tariffs found.</Alert>}

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
                      <Tooltip title="Activate" arrow>
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
                      <Tooltip title="Deactivate" arrow>
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
                      <Tooltip title="Delete" arrow>
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
        title="Confirm action"
        content={confirmAction ? `You are about to ${confirmAction} ${table.selected.length} tariff(s).` : ''}
        action={
          <Button variant="contained" color="primary" onClick={handleConfirmAction}>
            Confirm
          </Button>
        }
      />
    </Container>
  );
}
