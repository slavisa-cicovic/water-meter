import { TableRow, TableCell, Stack, IconButton, Tooltip, Checkbox, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import Iconify from 'src/components/iconify';
import { JobDefinition } from 'src/types/jobs';

type Props = {
  row: JobDefinition;
  selected?: boolean;
  onSelectRow?: VoidFunction;
  onEdit: (job: JobDefinition) => void;
  onRun: (job: JobDefinition) => void;
  onToggleDetails: (jobId: string) => void;
  expanded?: boolean;
  selectable?: boolean;
};

const formatTime = (hour: number, minute: number) =>
  `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

const scheduleLabel = (job: JobDefinition) => {
  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weekdayLabel = weekdays[job.scheduleConfig.weekday - 1] || '-';
  const time = formatTime(job.scheduleConfig.hour, job.scheduleConfig.minute);
  if (job.scheduleType === 'weekly') return `Every ${weekdayLabel} at ${time}`;
  if (job.scheduleType === 'monthly') return `First ${weekdayLabel} of month at ${time}`;
  return `First ${weekdayLabel} of year at ${time}`;
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
}: Props) {
  return (
    <TableRow hover>
      <TableCell padding="checkbox">
        <Checkbox checked={!!selected} onChange={onSelectRow} disabled={!selectable} />
      </TableCell>
      <TableCell sx={{ minWidth: 220 }}>
        <Typography variant="subtitle2">{row.name}</Typography>
      </TableCell>
      <TableCell sx={{ minWidth: 200 }}>{row.handlerKey}</TableCell>
      <TableCell sx={{ minWidth: 240 }}>{scheduleLabel(row)}</TableCell>
      <TableCell sx={{ width: 160 }}>{formatDateTime(row.nextRunAt)}</TableCell>
      <TableCell sx={{ width: 120 }}>
        <Tooltip title={row.enabled ? 'Enabled' : 'Disabled'}>
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
          <Tooltip title="Details">
            <IconButton size="small" onClick={() => onToggleDetails(row.id)}>
              <Iconify icon={expanded ? 'eva:chevron-up-outline' : 'eva:chevron-down-outline'} width={16} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Run now">
            <span>
              <IconButton size="small" onClick={() => onRun(row)} disabled={!row.enabled}>
                <PlayArrowIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => onEdit(row)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </TableCell>
    </TableRow>
  );
}
