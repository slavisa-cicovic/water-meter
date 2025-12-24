'use client';

import { useMemo, useState } from 'react';
// @mui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import EditIcon from '@mui/icons-material/Edit';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
// api
import { JobsApi, useGetJobs } from 'src/api/jobs';
// types
import { JobCreateInput, JobDefinition, JobScheduleType } from 'src/types/jobs';
// handlers
import { jobHandlerOptions } from 'src/services/job-handlers';

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

const scheduleLabel = (job: JobDefinition) => {
  const weekday = weekdayOptions.find((item) => item.value === job.scheduleConfig.weekday)?.label || '-';
  const time = formatTime(job.scheduleConfig.hour, job.scheduleConfig.minute);
  if (job.scheduleType === 'weekly') return `Every ${weekday} at ${time}`;
  if (job.scheduleType === 'monthly') return `First ${weekday} of month at ${time}`;
  return `First ${weekday} of year at ${time}`;
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

export function JobsListView() {
  const { jobs, jobsLoading, mutate } = useGetJobs();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobDefinition | null>(null);
  const [formState, setFormState] = useState(defaultFormState);
  const [formError, setFormError] = useState('');

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

  const handleRunNow = async (jobId: string) => {
    try {
      await JobsApi.runJobNow(jobId);
      await mutate();
    } catch (error) {
      setFormError('Failed to run job.');
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

  const jobRows = useMemo(() => jobs, [jobs]);

  return (
    <Container maxWidth="xl">
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h4">Job scheduler</Typography>
        <Button variant="contained" onClick={openCreate}>
          New job
        </Button>
      </Stack>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Handler</TableCell>
                <TableCell>Schedule</TableCell>
                <TableCell>Next run</TableCell>
                <TableCell>Enabled</TableCell>
                <TableCell>Retry</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {jobsLoading && (
                <TableRow>
                  <TableCell colSpan={7}>Loading...</TableCell>
                </TableRow>
              )}
              {!jobsLoading && jobRows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7}>No jobs found.</TableCell>
                </TableRow>
              )}
              {jobRows.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>{job.name}</TableCell>
                  <TableCell>{job.handlerKey}</TableCell>
                  <TableCell>{scheduleLabel(job)}</TableCell>
                  <TableCell>{job.nextRunAt ? job.nextRunAt.slice(0, 19).replace('T', ' ') : '-'}</TableCell>
                  <TableCell>{job.enabled ? 'Yes' : 'No'}</TableCell>
                  <TableCell>{`${job.maxAttempts}x / ${job.backoffSeconds}s`}</TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'inline-flex', gap: 1 }}>
                      <Tooltip title="Run now">
                        <span>
                          <IconButton size="small" onClick={() => handleRunNow(job.id)}>
                            <PlayArrowIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => openEdit(job)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
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
    </Container>
  );
}
