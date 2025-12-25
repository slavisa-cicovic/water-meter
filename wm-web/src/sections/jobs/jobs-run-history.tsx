import { Box, Stack, Typography } from '@mui/material';
import { JobRun } from 'src/types/jobs';

type Props = {
  runs: JobRun[];
  loading?: boolean;
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

const renderSummary = (summary?: Record<string, any>) => {
  if (!summary) return '-';
  if (summary.issuedInvoices !== undefined) {
    const eligible = summary.eligibleInvoices ?? summary.issuedInvoices;
    return `Issued ${summary.issuedInvoices}/${eligible}`;
  }
  if (summary.createdInvoices !== undefined) {
    const total = summary.totalInvoices ?? summary.createdInvoices;
    return `Created ${summary.createdInvoices}/${total}`;
  }
  return JSON.stringify(summary);
};

export function JobsRunHistory({ runs, loading }: Props) {
  return (
    <Stack spacing={1.5}>
      <Typography variant="subtitle2">Recent runs</Typography>
      {loading && <Typography variant="body2">Loading runs...</Typography>}
      {!loading && runs.length === 0 && <Typography variant="body2">No runs yet.</Typography>}
      {!loading &&
        runs.map((run) => (
          <Box
            key={run.id}
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '180px 180px 100px 1fr' },
              gap: 1,
              alignItems: 'center',
              p: 1.5,
              borderRadius: 1,
              bgcolor: 'background.neutral',
            }}
          >
            <Typography variant="body2">Started: {formatDateTime(run.runAt)}</Typography>
            <Typography variant="body2">Finished: {formatDateTime(run.finishedAt)}</Typography>
            <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
              {run.status}
            </Typography>
            <Typography variant="body2" color={run.error ? 'error' : 'text.secondary'}>
              {run.error ? run.error : renderSummary(run.resultSummary)}
            </Typography>
          </Box>
        ))}
    </Stack>
  );
}
