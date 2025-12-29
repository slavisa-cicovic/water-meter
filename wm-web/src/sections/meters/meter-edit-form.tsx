import { yupResolver } from '@hookform/resolvers/yup';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Grid from '@mui/material/Grid2';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import TableHead from '@mui/material/TableHead';
import TableContainer from '@mui/material/TableContainer';
import Button from '@mui/material/Button';
import LoadingButton from '@mui/lab/LoadingButton';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Collapse from '@mui/material/Collapse';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import EditIcon from '@mui/icons-material/Edit';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import * as Yup from 'yup';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import FormProvider, { RHFTextField } from 'src/components/hook-form';
import Scrollbar from 'src/components/scrollbar';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { AccountRole } from 'src/types/accounts';
import { Meter } from 'src/types/meters';
import { Fragment, ReactNode, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useGetAccounts } from 'src/api/accounts';
import { MetersApi } from 'src/api/meters-actions';
import { ReadingsApi, useGetReadings } from 'src/api/readings';
import { useGetSettings } from 'src/api/settings';
import { ChartWrapper, useChart } from 'src/components/chart';
import { useAuthContext } from 'src/auth/hooks';

type Props = {
  currentMeter?: Meter;
};

type TruncatedTextProps = {
  text: string;
  maxWidth?: number;
};

function TruncatedText({ text, maxWidth = 260 }: TruncatedTextProps) {
  const textRef = useRef<HTMLSpanElement | null>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useLayoutEffect(() => {
    const el = textRef.current;
    if (!el) return;
    setIsTruncated(el.scrollWidth > el.clientWidth);
  }, [text, maxWidth]);

  const content = (
    <Typography
      ref={textRef}
      variant="body2"
      component="span"
      sx={{
        maxWidth,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        display: 'inline-block',
      }}
    >
      {text}
    </Typography>
  );

  if (!isTruncated) {
    return content;
  }

  return <Tooltip title={text}>{content}</Tooltip>;
}

export function MeterEditForm({ currentMeter }: Props) {
  const router = useRouter();
  const isCreate = !currentMeter;
  const { user } = useAuthContext();

  const MeterSchema = Yup.object().shape({
    serialNumber: Yup.string().required('Required'),
    address: isCreate ? Yup.string().required('Required') : Yup.string(),
    type: isCreate ? Yup.string().required('Required') : Yup.string(),
    status: isCreate ? Yup.string() : Yup.string().required('Required'),
  });

  const defaultValues = {
    serialNumber: currentMeter?.serialNumber || '',
    groupCode: currentMeter?.groupCode || '',
    address: currentMeter?.address || '',
    type: currentMeter?.type || 'mechanical',
    status: currentMeter?.status || 'inactive',
  };

  const methods = useForm({
    resolver: yupResolver(MeterSchema),
    defaultValues,
    mode: 'onChange',
  });

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = methods;

  const [selectedConsumers, setSelectedConsumers] = useState<string[]>([]);
  const { accounts } = useGetAccounts({ type: 'consumer' });

  const meterId = currentMeter?.id;
  const currentYear = new Date().getFullYear();
  const [readingFrom, setReadingFrom] = useState(`${currentYear}-01-01`);
  const [readingTo, setReadingTo] = useState(`${currentYear}-12-31`);
  const [readingsTab, setReadingsTab] = useState<'chart' | 'table'>('chart');
  const [expandedReadings, setExpandedReadings] = useState<Set<string>>(new Set());
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingReadingId, setEditingReadingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editReason, setEditReason] = useState('');
  const [editError, setEditError] = useState('');
  const [editReasonError, setEditReasonError] = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const [editBounds, setEditBounds] = useState<{ min?: number; max?: number } | null>(null);
  const { readings, readingsLoading, readingsEmpty, mutate: mutateReadings } = useGetReadings(
    meterId ? { meterId, from: readingFrom || undefined, to: readingTo || undefined } : undefined
  );

  const onSubmit = async (data: any) => {
    if (isCreate) {
      const result = await MetersApi.create({
        serialNumber: data.serialNumber,
        groupCode: data.groupCode || undefined,
        address: data.address,
        type: data.type,
        status: 'inactive',
      });

      if (result?.meterId) {
        if (selectedConsumers.length) {
          await Promise.all(
            selectedConsumers.map((accountId) => MetersApi.addConsumer(result.meterId, accountId))
          );
        }
        router.push(paths.dashboard.meters.details(result.meterId));
      }
      return;
    }

    if (currentMeter?.id) {
      await MetersApi.update({
        id: currentMeter.id,
        serialNumber: data.serialNumber,
        groupCode: data.groupCode || null,
        status: data.status,
      });
      router.push(paths.dashboard.meters.details(currentMeter.id));
    }
  };

  const handleCancelEdit = () => {
    reset(defaultValues);
  };

  const sortedReadings = useMemo(() => {
    return [...readings].sort((a, b) => {
      const aTime = new Date(a.readAt).getTime();
      const bTime = new Date(b.readAt).getTime();
      return bTime - aTime;
    });
  }, [readings]);

  const readingsChartData = useMemo(() => {
    if (!readings?.length) return { categories: [] as string[], data: [] as number[] };

    const totals = new Map<number, { label: string; total: number }>();

    sortedReadings.forEach((reading, index) => {
      const prev = sortedReadings[index + 1];
      if (!prev) return;

      const consumption = reading.value - prev.value;
      const readDate = new Date(reading.readAt);

      if (!Number.isFinite(consumption) || Number.isNaN(readDate.getTime())) {
        return;
      }

      const bucket = new Date(readDate.getFullYear(), readDate.getMonth(), 1).getTime();
      const label = format(readDate, 'MMM yyyy');
      const current = totals.get(bucket);

      totals.set(bucket, { label, total: (current?.total || 0) + consumption });
    });

    const sorted = Array.from(totals.entries()).sort((a, b) => a[0] - b[0]);

    return {
      categories: sorted.map(([, value]) => value.label),
      data: sorted.map(([, value]) => value.total),
    };
  }, [sortedReadings]);

  const chartOptions = useChart(
    useMemo(
      () => ({
        xaxis: { categories: readingsChartData.categories },
        tooltip: {
          y: {
            formatter: (value: number) => `${value}`,
            title: { formatter: () => 'Consumption' },
          },
        },
      }),
      [readingsChartData.categories]
    )
  );

  const chartSeries = useMemo(
    () => [{ name: 'Consumption', data: readingsChartData.data }],
    [readingsChartData.data]
  );

  const hasChartData = readingsChartData.data.length > 0;

  const renderReadingsContent = (content: React.ReactNode) => {
    if (readingsLoading) return <Typography variant="body2">Loading readings...</Typography>;
    if (readingsEmpty) return <Typography variant="body2">No readings found.</Typography>;
    return content;
  };

  const consumerRowHeight = 26;
  const maxConsumerRows = 8;
  const consumers = currentMeter?.consumers || [];

  const viewerRole = (user as any)?.role as AccountRole | undefined;
  const viewerId = (user as any)?.accountId || (user as any)?.id;
  const canEditReadings = viewerRole === 'staff_backoffice';

  const getMonthKey = (date: string) => {
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return '';
    return `${parsed.getFullYear()}-${parsed.getMonth()}`;
  };

  const { settings: appSettings } = useGetSettings();
  const effectiveDate = useMemo(() => {
    const now = new Date();
    if (appSettings?.currentDateMode !== 'manual' || !appSettings.currentDateValue) return now;
    const parsed = new Date(`${appSettings.currentDateValue}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) return now;
    return new Date(
      parsed.getFullYear(),
      parsed.getMonth(),
      parsed.getDate(),
      now.getHours(),
      now.getMinutes(),
      now.getSeconds(),
      now.getMilliseconds()
    );
  }, [appSettings?.currentDateMode, appSettings?.currentDateValue]);
  const currentMonthKey = `${effectiveDate.getFullYear()}-${effectiveDate.getMonth()}`;

  const handleOpenEditDialog = (readingId: string, index: number) => {
    const reading = sortedReadings[index];
    if (!reading) return;
    const prev = sortedReadings[index + 1];
    const next = sortedReadings[index - 1];
    const latestEdit = reading.edits && reading.edits.length ? reading.edits[0] : undefined;
    setEditingReadingId(readingId);
    setEditValue(String(reading.value));
    setEditError('');
    setEditReason(latestEdit?.reason || '');
    setEditReasonError('');
    setEditBounds({
      min: prev ? prev.value : undefined,
      max: next ? next.value : undefined,
    });
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    if (editSaving) return;
    setEditDialogOpen(false);
    setEditingReadingId(null);
    setEditValue('');
    setEditError('');
    setEditReason('');
    setEditReasonError('');
    setEditBounds(null);
  };

  const handleSaveEdit = async () => {
    if (!editingReadingId) return;
    const numericValue = Number(editValue);

    if (!Number.isFinite(numericValue)) {
      setEditError('Enter a valid number.');
      return;
    }

    if (!editReason.trim()) {
      setEditReasonError('Reason is required.');
      return;
    }

    if (editBounds?.min !== undefined && numericValue < editBounds.min) {
      setEditError(`Value must be >= ${editBounds.min}.`);
      return;
    }

    if (editBounds?.max !== undefined && numericValue > editBounds.max) {
      setEditError(`Value must be <= ${editBounds.max}.`);
      return;
    }

    if (!viewerId || !viewerRole) {
      setEditError('Missing editor information.');
      return;
    }

    setEditSaving(true);
    try {
      await ReadingsApi.updateReading(editingReadingId, {
        id: editingReadingId,
        value: numericValue,
        editReason,
        editorAccountId: viewerId,
        editorRole: viewerRole,
      });
      await mutateReadings();
      handleCloseEditDialog();
    } catch (error) {
      setEditError('Failed to update reading.');
    } finally {
      setEditSaving(false);
    }
  };

  const toggleReadingExpanded = (readingId: string) => {
    setExpandedReadings((prev) => {
      const next = new Set(prev);
      if (next.has(readingId)) {
        next.delete(readingId);
      } else {
        next.add(readingId);
      }
      return next;
    });
  };
  const consumerListHeight = consumerRowHeight * Math.min(consumers.length, maxConsumerRows);

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: isCreate ? 12 : 5 }}>
          <Card>
            <CardHeader title={isCreate ? 'Register new meter' : 'Meter details'} />
            <CardContent>
              {isCreate ? (
                <Stack spacing={2}>
                  <RHFTextField name="serialNumber" label="Serial number" />
                  <RHFTextField name="groupCode" label="Group code (01-99)" />
                  <RHFTextField name="address" label="Address" />
                  <TextField
                    select
                    label="Type"
                    value={methods.getValues('type')}
                    onChange={(event) => methods.setValue('type', event.target.value)}
                  >
                    <MenuItem value="automatic">automatic</MenuItem>
                    <MenuItem value="mechanical">mechanical</MenuItem>
                  </TextField>
                  <TextField
                    select
                    label="Consumers"
                    slotProps={{ select: { multiple: true } }}
                    value={selectedConsumers}
                    onChange={(event) => setSelectedConsumers(event.target.value as unknown as string[])}
                  >
                    {accounts.map((acct) => (
                      <MenuItem key={acct.id} value={acct.id}>
                        {acct.data.firstName} {acct.data.lastName}
                      </MenuItem>
                    ))}
                  </TextField>
                  <Typography variant="caption" color="text.secondary">
                    Status is set to inactive on create.
                  </Typography>
                </Stack>
              ) : (
                <>
                  <Stack spacing={2}>
                    <RHFTextField name="serialNumber" label="Serial number" />
                    <RHFTextField name="groupCode" label="Group code (01-99)" />
                    <RHFTextField name="address" label="Address" disabled />
                    <RHFTextField name="status" label="Status" select>
                      <MenuItem value="active">active</MenuItem>
                      <MenuItem value="inactive">inactive</MenuItem>
                      <MenuItem value="removed">removed</MenuItem>
                    </RHFTextField>
                    <RHFTextField name="type" label="Type" select disabled>
                      <MenuItem value="automatic">automatic</MenuItem>
                      <MenuItem value="mechanical">mechanical</MenuItem>
                    </RHFTextField>
                    <Stack direction="row" justifyContent="flex-end" spacing={1}>
                      <Button variant="outlined" onClick={handleCancelEdit}>
                        Cancel
                      </Button>
                      <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                        Save changes
                      </LoadingButton>
                    </Stack>
                    <Stack spacing={1}>
                      <Typography variant="subtitle2">Consumers</Typography>
                      {consumers.length === 0 && (
                        <Typography variant="body2" color="text.secondary">
                          No consumers linked.
                        </Typography>
                      )}
                      {consumers.length > 0 && (
                        <Scrollbar sx={{ height: consumerListHeight || consumerRowHeight }}>
                          <Table size="small">
                            <TableBody>
                              {consumers.map((consumer) => (
                                <TableRow key={consumer.id} sx={{ height: consumerRowHeight }}>
                                  <TableCell sx={{ width: '45%' }}>
                                    <Typography variant="body2">
                                      {consumer.firstName} {consumer.lastName}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    <Typography variant="body2" color="text.secondary">
                                      {consumer.address}
                                    </Typography>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </Scrollbar>
                      )}
                    </Stack>
                  </Stack>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {!isCreate && (
          <Grid size={{ xs: 12, md: 7 }}>
            <Card>
              <CardHeader title="Readings history" />
              <CardContent>
                {renderReadingsContent(
                  <Stack spacing={2}>
                    <Stack direction="row" spacing={2}>
                      <TextField
                        label="From"
                        type="date"
                        value={readingFrom}
                        onChange={(event) => setReadingFrom(event.target.value)}
                        slotProps={{ inputLabel: { shrink: true } }}
                        sx={{ minWidth: 160 }}
                      />
                      <TextField
                        label="To"
                        type="date"
                        value={readingTo}
                        onChange={(event) => setReadingTo(event.target.value)}
                        slotProps={{ inputLabel: { shrink: true } }}
                        sx={{ minWidth: 160 }}
                      />
                    </Stack>

                    <Tabs value={readingsTab} onChange={(_, value) => setReadingsTab(value)}>
                      <Tab value="chart" label="Chart" />
                      <Tab value="table" label="Table" />
                    </Tabs>

                    {readingsTab === 'chart' &&
                      (hasChartData ? (
                        <ChartWrapper type="bar" series={chartSeries} options={chartOptions} height={360} />
                      ) : (
                        <Typography variant="body2">Add at least two readings to see trends.</Typography>
                      ))}

                    {readingsTab === 'table' && (
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell sx={{ width: 48 }} />
                              <TableCell sx={{ width: 160 }}>Date</TableCell>
                              <TableCell sx={{ width: 140 }}>Method</TableCell>
                              <TableCell sx={{ width: 120 }}>Value</TableCell>
                              <TableCell sx={{ width: 140 }}>Consumption</TableCell>
                              <TableCell sx={{ width: 80 }}>Actions</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {sortedReadings.map((reading, index) => {
                              const prev = sortedReadings[index + 1];
                              const consumption = prev ? reading.value - prev.value : undefined;
                              const canEdit =
                                canEditReadings && getMonthKey(reading.readAt) === currentMonthKey;
                              const hasEdits = Boolean(reading.edits && reading.edits.length);
                              const isExpanded = expandedReadings.has(reading.id);
                              return (
                                <Fragment key={reading.id}>
                                  <TableRow>
                                    <TableCell sx={{ width: 48 }}>
                                      {hasEdits ? (
                                        <IconButton
                                          size="small"
                                          onClick={() => toggleReadingExpanded(reading.id)}
                                          aria-label={isExpanded ? 'Collapse edits' : 'Expand edits'}
                                        >
                                          {isExpanded ? (
                                            <KeyboardArrowDownIcon fontSize="small" />
                                          ) : (
                                            <KeyboardArrowRightIcon fontSize="small" />
                                          )}
                                        </IconButton>
                                      ) : null}
                                    </TableCell>
                                    <TableCell sx={{ width: 160 }}>{reading.readAt?.slice(0, 10)}</TableCell>
                                    <TableCell sx={{ width: 140 }}>{reading.method}</TableCell>
                                    <TableCell sx={{ width: 120 }}>{reading.value}</TableCell>
                                    <TableCell sx={{ width: 140 }}>
                                      {consumption !== undefined ? consumption : '-'}
                                    </TableCell>
                                    <TableCell sx={{ width: 80 }}>
                                      <IconButton
                                        size="small"
                                        disabled={!canEdit}
                                        onClick={() => handleOpenEditDialog(reading.id, index)}
                                        aria-label="Edit reading"
                                      >
                                        <EditIcon fontSize="small" />
                                      </IconButton>
                                    </TableCell>
                                  </TableRow>
                                  {hasEdits ? (
                                    <TableRow sx={{ backgroundColor: 'action.hover' }}>
                                      <TableCell colSpan={6} sx={{ py: 0 }}>
                                        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                                          <Stack
                                            spacing={1.5}
                                            sx={{
                                              py: 1,
                                              px: 2,
                                              borderLeft: '3px solid',
                                              borderColor: 'divider',
                                            }}
                                          >
                                            <Typography variant="subtitle2">Edit history</Typography>
                                            <Table size="small">
                                              <TableHead>
                                                <TableRow>
                                                  <TableCell sx={{ width: 180 }}>Editor</TableCell>
                                                  <TableCell sx={{ width: 160 }}>Edited at</TableCell>
                                                  <TableCell sx={{ width: 120 }}>Value</TableCell>
                                                  <TableCell>Reason</TableCell>
                                                </TableRow>
                                              </TableHead>
                                              <TableBody>
                                                {reading.edits?.map((edit) => (
                                                  <TableRow key={edit.id}>
                                                    <TableCell sx={{ width: 180 }}>
                                                      {[edit.editorFirstName, edit.editorLastName]
                                                        .filter(Boolean)
                                                        .join(' ') || '-'}
                                                    </TableCell>
                                                    <TableCell sx={{ width: 160 }}>
                                                      {edit.editedAt?.slice(0, 16).replace('T', ' ') || '-'}
                                                    </TableCell>
                                                    <TableCell sx={{ width: 120 }}>{edit.value}</TableCell>
                                                    <TableCell>
                                                      {edit.reason ? (
                                                        <TruncatedText text={edit.reason} />
                                                      ) : (
                                                        '-'
                                                      )}
                                                    </TableCell>
                                                  </TableRow>
                                                ))}
                                              </TableBody>
                                            </Table>
                                          </Stack>
                                        </Collapse>
                                      </TableCell>
                                    </TableRow>
                                  ) : null}
                                </Fragment>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Grid>
        )}

        {isCreate && (
          <Grid
            size={{ xs: 12 }}
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', columnGap: 1 }}
          >
            <Button variant="outlined" onClick={() => router.push(paths.dashboard.meters.root)}>
              Cancel
            </Button>
            <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
              Create meter
            </LoadingButton>
          </Grid>
        )}
      </Grid>

      <Dialog open={editDialogOpen} onClose={handleCloseEditDialog} fullWidth maxWidth="sm">
        <DialogTitle>Edit reading</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Value"
              type="number"
              value={editValue}
              onChange={(event) => {
                setEditValue(event.target.value);
                if (editError) setEditError('');
              }}
              error={Boolean(editError)}
              helperText={
                editError ||
                (editBounds
                  ? `Allowed range: min ${editBounds.min ?? 'none'}, max ${editBounds.max ?? 'none'}`
                  : undefined)
              }
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              label="Reason"
              value={editReason}
              onChange={(event) => {
                setEditReason(event.target.value);
                if (editReasonError) setEditReasonError('');
              }}
              error={Boolean(editReasonError)}
              helperText={editReasonError || 'Required'}
              multiline
              minRows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog} disabled={editSaving}>
            Cancel
          </Button>
          <Button onClick={handleSaveEdit} variant="contained" disabled={editSaving}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </FormProvider>
  );
}
