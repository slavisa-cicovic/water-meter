import { TableRow, TableCell, Stack, IconButton, Tooltip, Checkbox, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import Iconify from 'src/components/iconify';
import { JobDefinition } from 'src/types/jobs';
import { useLocales } from 'src/locales';

type Props = {
  row: JobDefinition;
  selected?: boolean;
  onSelectRow?: VoidFunction;
  onEdit: (job: JobDefinition) => void;
  onRun: (job: JobDefinition) => void;
  onToggleDetails: (jobId: string) => void;
  expanded?: boolean;
  selectable?: boolean;
  canEdit?: boolean;
  canRun?: boolean;
};

const formatTime = (hour: number, minute: number) =>
  `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

const scheduleLabel = (job: JobDefinition, t: (key: string, options?: any) => string) => {
  const weekdayKeys = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  const weekdayKey = weekdayKeys[job.scheduleConfig.weekday - 1] || 'mon';
  const weekdayLabel = t(`jobs.weekday.short.${weekdayKey}`);
  const time = formatTime(job.scheduleConfig.hour, job.scheduleConfig.minute);
  if (job.scheduleType === 'weekly') {
    return t('jobs.schedule.weekly', { weekday: weekdayLabel, time });
  }
  if (job.scheduleType === 'monthly') {
    return t('jobs.schedule.monthly', { weekday: weekdayLabel, time });
  }
  return t('jobs.schedule.yearly', { weekday: weekdayLabel, time });
};

const formatDateTime = (value?: string) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
};

export function JobsTableRow({
  row,
  selected,
  onSelectRow,
  onEdit,
  onRun,
  onToggleDetails,
  expanded = false,
  selectable = true,
  canEdit = true,
  canRun = true,
}: Props) {
  const { t } = useLocales();
  return (
    <TableRow hover>
      <TableCell padding="checkbox">
        <Checkbox checked={!!selected} onChange={onSelectRow} disabled={!selectable} />
      </TableCell>
      <TableCell sx={{ minWidth: 220 }}>
        <Typography variant="subtitle2">{row.name}</Typography>
      </TableCell>
      <TableCell sx={{ minWidth: 200 }}>{row.handlerKey}</TableCell>
      <TableCell sx={{ minWidth: 240 }}>{scheduleLabel(row, t)}</TableCell>
      <TableCell sx={{ width: 160 }}>{formatDateTime(row.nextRunAt)}</TableCell>
      <TableCell sx={{ width: 120 }}>
        <Tooltip title={row.enabled ? t('jobs.status.enabled') : t('jobs.status.disabled')}>
          <span>
            <Iconify
              icon={row.enabled ? 'eva:checkmark-circle-2-fill' : 'eva:slash-outline'}
              width={18}
              sx={{ color: row.enabled ? 'success.main' : 'text.secondary' }}
            />
          </span>
        </Tooltip>
      </TableCell>
      <TableCell sx={{ width: 140 }}>{`${row.maxAttempts}x / ${row.backoffSeconds}s`}</TableCell>
      <TableCell align="right" sx={{ width: 120 }}>
        <Stack direction="row" justifyContent="flex-end" spacing={1}>
          <Tooltip title={t('jobs.actions.details')}>
            <IconButton size="small" onClick={() => onToggleDetails(row.id)}>
              <Iconify icon={expanded ? 'eva:chevron-up-outline' : 'eva:chevron-down-outline'} width={16} />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('jobs.actions.runNow')}>
            <span>
              <IconButton size="small" onClick={() => onRun(row)} disabled={!row.enabled || !canRun}>
                <PlayArrowIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title={t('jobs.actions.edit')}>
            <span>
              <IconButton size="small" onClick={() => onEdit(row)} disabled={!canEdit}>
                <EditIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      </TableCell>
    </TableRow>
  );
}
