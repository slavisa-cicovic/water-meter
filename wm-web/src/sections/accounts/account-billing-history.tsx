import { ReactNode } from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid2';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { ChartWrapper } from 'src/components/chart';
import Iconify from 'src/components/iconify';
import { formatCurrencyValue } from 'src/utils/format-currency';
import { Invoice, InvoiceStatus } from 'src/types/billings';

type BillingBucket = {
  key: string;
  label: string;
  total: number;
  flags: Set<string>;
  latestInvoice: Invoice | null;
  latestCreatedAt: number;
};

type Props = {
  t: (key: string, options?: Record<string, any>) => string;
  billingFrom: string;
  billingTo: string;
  billingStatus: '' | InvoiceStatus;
  billingStatusOptions: Array<{ label: string; value: InvoiceStatus }>;
  billingTab: 'chart' | 'table';
  billingChartSeries: Array<{ name: string; data: number[] }>;
  billingChartOptions: Record<string, any>;
  billingBuckets: BillingBucket[];
  currentMonthKey: string;
  currency?: string;
  invoicesLoading: boolean;
  onBillingFromChange: (value: string) => void;
  onBillingToChange: (value: string) => void;
  onBillingStatusChange: (value: '' | InvoiceStatus) => void;
  onBillingTabChange: (value: 'chart' | 'table') => void;
  onOpenReviewDialog: (invoice: Invoice) => void;
  onOpenConfirmDialog: (invoice: Invoice) => void;
  getInvoiceStatusColor: (status: InvoiceStatus) => 'success' | 'secondary' | 'info' | 'default' | 'warning';
};

export default function AccountBillingHistory({
  t,
  billingFrom,
  billingTo,
  billingStatus,
  billingStatusOptions,
  billingTab,
  billingChartSeries,
  billingChartOptions,
  billingBuckets,
  currentMonthKey,
  currency,
  invoicesLoading,
  onBillingFromChange,
  onBillingToChange,
  onBillingStatusChange,
  onBillingTabChange,
  onOpenReviewDialog,
  onOpenConfirmDialog,
  getInvoiceStatusColor,
}: Props) {
  const renderBillingContent = (content: ReactNode) => {
    if (invoicesLoading) return <Typography variant="body2">{t('accounts.billing.loading')}</Typography>;
    return content;
  };

  return (
    <Grid size={{ xs: 12, md: 8 }}>
      <Card>
        <CardHeader title={t('accounts.billing.title')} />
        <CardContent>
          <Stack direction="row" spacing={2} mb={2}>
            <TextField
              label={t('accounts.billing.filters.createdFrom')}
              type="date"
              value={billingFrom}
              onChange={(event) => onBillingFromChange(event.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{ minWidth: 160 }}
            />
            <TextField
              label={t('accounts.billing.filters.createdTo')}
              type="date"
              value={billingTo}
              onChange={(event) => onBillingToChange(event.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{ minWidth: 160 }}
            />
            <TextField
              select
              label={t('accounts.billing.filters.status')}
              value={billingStatus}
              onChange={(event) => onBillingStatusChange(event.target.value as '' | InvoiceStatus)}
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="">{t('accounts.filters.all')}</MenuItem>
              {billingStatusOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Stack>

          <Tabs value={billingTab} onChange={(_, value) => onBillingTabChange(value)} sx={{ mb: 2 }}>
            <Tab value="chart" label={t('accounts.common.chart')} />
            <Tab value="table" label={t('accounts.common.table')} />
          </Tabs>

          {billingTab === 'chart' &&
            renderBillingContent(
              <ChartWrapper type="bar" series={billingChartSeries} options={billingChartOptions} height={320} />
            )}

          {billingTab === 'table' &&
            renderBillingContent(
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ width: 180 }}>{t('accounts.billing.table.month')}</TableCell>
                      <TableCell sx={{ width: 120 }}>{t('accounts.billing.table.total')}</TableCell>
                      <TableCell sx={{ width: 120 }}>{t('accounts.billing.table.status')}</TableCell>
                      <TableCell sx={{ width: 80 }} align="right">
                        {t('accounts.billing.table.reviewFlags')}
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {billingBuckets.map((bucket) => {
                      const status = bucket.latestInvoice?.status;
                      const flags = Array.from(bucket.flags.values());
                      const invoice = bucket.latestInvoice;
                      const canEdit = invoice?.status === 'draft' && bucket.key === currentMonthKey;
                      const canConfirm =
                        invoice?.status === 'draft' &&
                        bucket.key === currentMonthKey &&
                        (!invoice.reviewFlags || invoice.reviewFlags.length === 0);
                      return (
                        <TableRow key={bucket.key}>
                          <TableCell sx={{ width: 180 }}>{bucket.label}</TableCell>
                          <TableCell sx={{ width: 120 }}>
                            {formatCurrencyValue(bucket.total, currency)}
                          </TableCell>
                          <TableCell sx={{ width: 120 }}>
                            {status ? (
                              <Chip
                                size="small"
                                label={t(`accounts.billing.status.${status}`)}
                                color={getInvoiceStatusColor(status)}
                                clickable={canConfirm}
                                onClick={canConfirm && invoice ? () => onOpenConfirmDialog(invoice) : undefined}
                              />
                            ) : (
                              ''
                            )}
                          </TableCell>
                          <TableCell sx={{ width: 80 }} align="right">
                            <Stack direction="row" spacing={1} alignItems="center" justifyContent="flex-end">
                              {flags.length > 0 && (
                                <Tooltip
                                  title={
                                    <Stack spacing={0.5} sx={{ py: 0.5 }}>
                                      {flags.map((flag) => (
                                        <Typography key={flag} variant="caption" display="block">
                                          {flag}
                                        </Typography>
                                      ))}
                                    </Stack>
                                  }
                                >
                                  <IconButton
                                    size="small"
                                    color="warning"
                                    onClick={canEdit && invoice ? () => onOpenReviewDialog(invoice) : undefined}
                                    aria-label={t('accounts.billing.table.reviewFlags')}
                                  >
                                    <Iconify icon="eva:alert-circle-fill" width={16} />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
        </CardContent>
      </Card>
    </Grid>
  );
}
