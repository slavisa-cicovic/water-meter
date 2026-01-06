'use client';

import React, { useCallback, useMemo, useState } from 'react';
// @mui
import {
  Alert,
  Button,
  Card,
  CardContent,
  Collapse,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Checkbox,
  Box,
  MenuItem,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TextField,
  Typography,
  Tooltip,
  IconButton,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
// api
import { JobsApi, useGetJobRuns, useGetJobs } from 'src/api/jobs';
// types
import { JobCreateInput, JobDefinition, JobScheduleType } from 'src/types/jobs';
// handlers
import { jobHandlerOptions } from 'src/services/job-handlers';
import { useSettingsContext } from 'src/components/settings';
import { TableHeadCustom, TableNoData, TablePaginationCustom, TableSelectedAction, useTable } from 'src/components/table';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import EmptyContent from 'src/components/empty-content';
import Iconify from 'src/components/iconify';
import { isEqual } from 'lodash';
import { JobsTableToolbar, IJobsTableFilters, IJobsTableFilterValue } from '../jobs-table-toolbar';
import { JobsTableFiltersResult } from '../jobs-table-filters-result';
import { JobsTableRow } from '../jobs-table-row';
import { JobsTableSkeleton } from '../jobs-skeleton';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { paths } from 'src/routes/paths';
import { JobsRunHistory } from '../jobs-run-history';
import { useAuthContext } from 'src/auth/hooks';
import { PERMISSIONS } from 'src/constants/permissions';

const weekdayOptions = [
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
  { value: 7, label: 'Sunday' },
];

const scheduleOptions: { value: JobScheduleType; label: string }[] = [
  { value: 'weekly', label: 'Every week' },
  { value: 'monthly', label: 'First weekday of month' },
  { value: 'yearly', label: 'First weekday of year' },
];

const formatTime = (hour: number, minute: number) =>
  `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

const parseTime = (value: string) => {
  const [hour, minute] = value.split(':').map(Number);
  return { hour: Number.isFinite(hour) ? hour : 0, minute: Number.isFinite(minute) ? minute : 0 };
};

const defaultFormState = {
  name: '',
  handlerKey: jobHandlerOptions[0]?.key || '',
  scheduleType: 'weekly' as JobScheduleType,
  weekday: 1,
  time: '09:00',
  maxAttempts: 3,
  backoffSeconds: 60,
  enabled: true,
};

const defaultFilters: IJobsTableFilters = {
  search: '',
  status: '',
};

const TABLE_HEAD = [
  { id: 'name', label: 'Name', minWidth: 220 },
  { id: 'handlerKey', label: 'Handler', minWidth: 200 },
  { id: 'schedule', label: 'Schedule', minWidth: 240, disableSort: true },
  { id: 'nextRunAt', label: 'Next run', width: 160 },
  { id: 'enabled', label: 'Enabled', width: 120 },
  { id: 'retry', label: 'Retry', width: 140, disableSort: true },
  { id: '', label: 'Actions', align: 'right', width: 120, disableSort: true },
];

export function JobsListView() {
  const settings = useSettingsContext();
  const { user } = useAuthContext();
  const userPermissions = (user?.permissions as string[]) || [];
  const canCreateJob = userPermissions.includes(PERMISSIONS.JOBS_CREATE);
  const canEditJob = userPermissions.includes(PERMISSIONS.JOBS_UPDATE);
  const canRunJob = userPermissions.includes(PERMISSIONS.JOBS_RUN);
  const canBulkUpdateJobs = userPermissions.includes(PERMISSIONS.JOBS_BULK_UPDATE);
  const canDeleteJobs = userPermissions.includes(PERMISSIONS.JOBS_DELETE);
  const table = useTable({ defaultRowsPerPage: 25, defaultDense: true, defaultOrderBy: 'name', defaultOrder: 'asc' });
  const [filters, setFilters] = useState(defaultFilters);

  const { jobs, total, jobsLoading, jobsError, jobsEmpty, mutate } = useGetJobs({
    search: filters.search || undefined,
    status: (filters.status || undefined) as 'enabled' | 'disabled' | undefined,
    orderBy: table.orderBy as any,
    order: table.order,
    page: table.page,
    pageSize: table.rowsPerPage,
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobDefinition | null>(null);
  const [formState, setFormState] = useState(defaultFormState);
  const [formError, setFormError] = useState('');
  const [runDialogOpen, setRunDialogOpen] = useState(false);
  const [runJob, setRunJob] = useState<JobDefinition | null>(null);
  const [overrideIssued, setOverrideIssued] = useState(false);
  const [overridePaid, setOverridePaid] = useState(false);
  const [overrideCounts, setOverrideCounts] = useState<{ issued: number; paid: number } | null>(null);
  const [overrideLoading, setOverrideLoading] = useState(false);
  const [runSubmitting, setRunSubmitting] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'delete' | 'activate' | 'deactivate' | null>(null);
  const [actionError, setActionError] = useState('');
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);

  const { runs, runsLoading } = useGetJobRuns(expandedJobId || undefined, 8);

  const selectableIds = jobs.map((job) => job.id);
  const selectedJobs = useMemo(() => jobs.filter((job) => table.selected.includes(job.id)), [jobs, table.selected]);
  const canActivate = selectedJobs.some((job) => !job.enabled);
  const canDeactivate = selectedJobs.some((job) => job.enabled);

  const resetForm = () => {
    setFormState(defaultFormState);
    setFormError('');
  };

  const openCreate = () => {
    setEditingJob(null);
    resetForm();
    setDialogOpen(true);
  };

  const openEdit = (job: JobDefinition) => {
    setEditingJob(job);
    setFormState({
      name: job.name,
      handlerKey: job.handlerKey,
      scheduleType: job.scheduleType,
      weekday: job.scheduleConfig.weekday,
      time: formatTime(job.scheduleConfig.hour, job.scheduleConfig.minute),
      maxAttempts: job.maxAttempts,
      backoffSeconds: job.backoffSeconds,
      enabled: job.enabled,
    });
    setFormError('');
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingJob(null);
  };

  const handleRunNow = async (job: JobDefinition) => {
    setExpandedJobId(null);
    await handleOpenRunDialog(job);
  };

  const handleOpenRunDialog = async (job: JobDefinition) => {
    setExpandedJobId(null);
    setRunJob(job);
    setOverrideIssued(false);
    setOverridePaid(false);
    setOverrideCounts(null);
    setRunDialogOpen(true);
    setOverrideLoading(true);
    if (job.handlerKey === 'billing_generate') {
      try {
        const preview = await JobsApi.runJobNow(job.id, { dryRun: true });
        setOverrideCounts({ issued: preview.issued || 0, paid: preview.paid || 0 });
      } catch (error) {
        setOverrideCounts({ issued: 0, paid: 0 });
      } finally {
        setOverrideLoading(false);
      }
      return;
    }
    setOverrideLoading(false);
  };

  const handleConfirmRun = async () => {
    if (!runJob) return;
    setRunSubmitting(true);
    try {
      if (runJob.handlerKey === 'billing_generate') {
        await JobsApi.runJobNow(runJob.id, { overrideIssued, overridePaid });
      } else {
        await JobsApi.runJobNow(runJob.id);
      }
      await mutate();
      setRunDialogOpen(false);
      setRunJob(null);
    } catch (error) {
      setFormError('Failed to run job.');
    } finally {
      setRunSubmitting(false);
    }
  };

  const handleSave = async () => {
    if (!formState.name.trim()) {
      setFormError('Name is required.');
      return;
    }

    const timeParts = parseTime(formState.time);
    const payload: JobCreateInput = {
      name: formState.name.trim(),
      handlerKey: formState.handlerKey,
      scheduleType: formState.scheduleType,
      scheduleConfig: {
        weekday: formState.weekday,
        hour: timeParts.hour,
        minute: timeParts.minute,
      },
      enabled: formState.enabled,
      maxAttempts: Number(formState.maxAttempts),
      backoffSeconds: Number(formState.backoffSeconds),
    };

    try {
      if (editingJob) {
        await JobsApi.updateJob(editingJob.id, { ...payload, id: editingJob.id });
      } else {
        await JobsApi.createJob(payload);
      }
      await mutate();
      handleCloseDialog();
    } catch (error) {
      setFormError('Failed to save job.');
    }
  };

  const handleFilters = useCallback(
    (name: string, value: IJobsTableFilterValue) => {
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
    setActionError('');
    setConfirmAction(action);
  };

  const handleCloseConfirm = () => {
    setConfirmAction(null);
  };

  const handleConfirmAction = async () => {
    if (!confirmAction) return;
    try {
      await JobsApi.bulkUpdate(table.selected as string[], confirmAction);
      table.setSelected([]);
      await mutate();
      setConfirmAction(null);
    } catch (error) {
      setActionError('Failed to update jobs.');
    }
  };

  const confirmContent = confirmAction
    ? `You are about to ${confirmAction} ${table.selected.length} job(s).`
    : '';

  const canReset = !isEqual(defaultFilters, filters);
  const notFound = (!jobs.length && canReset) || jobsEmpty;
  const columnsCount = TABLE_HEAD.length + 1;

  const handleToggleDetails = (jobId: string) => {
    setExpandedJobId((prev) => (prev === jobId ? null : jobId));
  };

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Job scheduler"
        description="Manage scheduled jobs and run billing generation."
        links={[
          { name: 'App', href: paths.dashboard.root },
          { name: 'Jobs', href: paths.dashboard.jobs.root },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Stack direction="row" alignItems="center" justifyContent="flex-end" sx={{ mb: 3 }}>
        {canCreateJob ? (
          <Button variant="contained" onClick={openCreate}>
            New job
          </Button>
        ) : null}
      </Stack>

      <Card>
        <JobsTableToolbar filters={filters} onFilters={handleFilters} />

        {canReset && (
          <JobsTableFiltersResult
            filters={filters}
            onFilters={handleFilters}
            onResetFilters={handleResetFilters}
            results={total}
            sx={{ p: 2.5, pt: 0 }}
          />
        )}

        <CardContent>
          {jobsError && (
            <EmptyContent filled title="Failed to load jobs." sx={{ py: 6 }} />
          )}

          {!jobsLoading && jobsEmpty && <Alert severity="info">No jobs found.</Alert>}

          {!jobsLoading && !jobsError && jobs && jobs.length > 0 && (
            <TableContainer sx={{ position: 'relative' }}>
              <TableSelectedAction
                dense={table.dense}
                rowCount={selectableIds.length}
                numSelected={table.selected.length}
                onSelectAllRows={(checked) => table.onSelectAllRows(checked, selectableIds)}
                actions={[
                  ...(canBulkUpdateJobs
                    ? [
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
                      ]
                    : []),
                  ...(canDeleteJobs
                    ? [
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
                      ]
                    : []),
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
                  {jobsLoading
                    ? [...Array(table.rowsPerPage)].map((_i, index) => (
                        <JobsTableSkeleton
                          key={index}
                          columns={TABLE_HEAD.map((el) => el.width || el.minWidth || 100)}
                          sx={{ height: table.dense ? 60 : 80 }}
                        />
                      ))
                    : jobs.map((job) => (
                        <React.Fragment key={job.id}>
                          <JobsTableRow
                            row={job}
                            selected={table.selected.includes(job.id)}
                            onSelectRow={() => table.onSelectRow(job.id)}
                            onEdit={openEdit}
                            onRun={handleRunNow}
                            onToggleDetails={handleToggleDetails}
                            expanded={expandedJobId === job.id}
                            canEdit={canEditJob}
                            canRun={canRunJob}
                          />
                          <TableRow>
                            <TableCell colSpan={columnsCount} sx={{ p: 0, borderBottom: 0 }}>
                              <Collapse in={expandedJobId === job.id} timeout="auto" unmountOnExit>
                                <Box sx={{ px: 3, py: 2, bgcolor: 'background.default' }}>
                                  <JobsRunHistory runs={runs} loading={runsLoading} />
                                </Box>
                              </Collapse>
                            </TableCell>
                          </TableRow>
                        </React.Fragment>
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

      <Dialog open={dialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>{editingJob ? 'Edit job' : 'New job'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Name"
              value={formState.name}
              onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
            />
            <TextField
              select
              label="Handler"
              value={formState.handlerKey}
              onChange={(event) => setFormState((prev) => ({ ...prev, handlerKey: event.target.value }))}
            >
              {jobHandlerOptions.map((option) => (
                <MenuItem key={option.key} value={option.key}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                select
                label="Schedule"
                value={formState.scheduleType}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, scheduleType: event.target.value as JobScheduleType }))
                }
                sx={{ flex: 1 }}
              >
                {scheduleOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Weekday"
                value={formState.weekday}
                onChange={(event) => setFormState((prev) => ({ ...prev, weekday: Number(event.target.value) }))}
                sx={{ flex: 1 }}
              >
                {weekdayOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Time"
                type="time"
                value={formState.time}
                onChange={(event) => setFormState((prev) => ({ ...prev, time: event.target.value }))}
                slotProps={{ inputLabel: { shrink: true } }}
                sx={{ flex: 1 }}
              />
              <TextField
                label="Max attempts"
                type="number"
                value={formState.maxAttempts}
                onChange={(event) => setFormState((prev) => ({ ...prev, maxAttempts: Number(event.target.value) }))}
                sx={{ flex: 1 }}
              />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Backoff seconds"
                type="number"
                value={formState.backoffSeconds}
                onChange={(event) => setFormState((prev) => ({ ...prev, backoffSeconds: Number(event.target.value) }))}
                sx={{ flex: 1 }}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formState.enabled}
                    onChange={(event) => setFormState((prev) => ({ ...prev, enabled: event.target.checked }))}
                  />
                }
                label="Enabled"
              />
            </Stack>
            {formError && <Typography color="error">{formError}</Typography>}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={runDialogOpen} onClose={() => setRunDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Run job</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <Typography variant="body2">
              {runJob ? `Run "${runJob.name}" now?` : 'Run selected job now?'}
            </Typography>
            {runJob?.handlerKey === 'billing_generate' && (
              <>
                <Typography variant="body2">
                  This will generate draft invoices for the current month. Existing issued/paid invoices can be voided
                  if you choose to overwrite them.
                </Typography>
                {overrideLoading ? (
                  <Typography variant="body2">Checking existing invoices...</Typography>
                ) : (
                  <Typography variant="body2">
                    Issued invoices: {overrideCounts?.issued ?? 0} · Paid invoices: {overrideCounts?.paid ?? 0}
                  </Typography>
                )}
                <FormControlLabel
                  control={
                    <Checkbox checked={overrideIssued} onChange={(event) => setOverrideIssued(event.target.checked)} />
                  }
                  label="Overwrite issued invoices (set to void)"
                />
                <FormControlLabel
                  control={
                    <Checkbox checked={overridePaid} onChange={(event) => setOverridePaid(event.target.checked)} />
                  }
                  label="Overwrite paid invoices (set to void)"
                />
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRunDialogOpen(false)} disabled={runSubmitting}>
            Cancel
          </Button>
          <LoadingButton
            variant="contained"
            onClick={handleConfirmRun}
            loading={runSubmitting}
            disabled={overrideLoading || runSubmitting}
          >
            Run now
          </LoadingButton>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={Boolean(confirmAction)}
        onClose={handleCloseConfirm}
        title="Confirm action"
        content={confirmContent}
        action={
          <Button variant="contained" color="primary" onClick={handleConfirmAction}>
            Confirm
          </Button>
        }
      />

      {actionError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {actionError}
        </Alert>
      )}
    </Container>
  );
}
