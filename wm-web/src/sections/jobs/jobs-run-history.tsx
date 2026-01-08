import { Box, Stack, Typography } from '@mui/material';
import { JobRun } from 'src/types/jobs';
import { useLocales } from 'src/locales';

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

const renderSummary = (summary: Record<string, any> | undefined, t: (key: string, options?: any) => string) => {
  if (!summary) return '-';
  if (summary.issuedInvoices !== undefined) {
    const eligible = summary.eligibleInvoices ?? summary.issuedInvoices;
    return t('jobs.runs.summary.issued', { count: summary.issuedInvoices, total: eligible });
  }
  if (summary.createdInvoices !== undefined) {
    const total = summary.totalInvoices ?? summary.createdInvoices;
    return t('jobs.runs.summary.created', { count: summary.createdInvoices, total });
  }
  return JSON.stringify(summary);
};

export function JobsRunHistory({ runs, loading }: Props) {
  const { t } = useLocales();
  return (
    <Stack spacing={1.5}>
      <Typography variant="subtitle2">{t('jobs.runs.title')}</Typography>
      {loading && <Typography variant="body2">{t('jobs.runs.loading')}</Typography>}
      {!loading && runs.length === 0 && <Typography variant="body2">{t('jobs.runs.empty')}</Typography>}
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
            <Typography variant="body2">
              {t('jobs.runs.started')}: {formatDateTime(run.runAt)}
            </Typography>
            <Typography variant="body2">
              {t('jobs.runs.finished')}: {formatDateTime(run.finishedAt)}
            </Typography>
            <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
              {t(`jobs.runs.status.${run.status}`, { defaultValue: run.status })}
            </Typography>
            <Typography variant="body2" color={run.error ? 'error' : 'text.secondary'}>
              {run.error ? run.error : renderSummary(run.resultSummary, t)}
            </Typography>
          </Box>
        ))}
    </Stack>
  );
}
