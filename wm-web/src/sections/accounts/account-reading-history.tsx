import { ReactNode } from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
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
import EditIcon from '@mui/icons-material/Edit';
import { ChartWrapper } from 'src/components/chart';
import { formatReadingValue, roundReadingValue } from 'src/utils/reading-format';
import { Reading } from 'src/types/readings';

type MeterOption = {
  id: string;
  groupCode?: string;
  address?: string;
  serialNumber?: string;
};

type Props = {
  t: (key: string, options?: Record<string, any>) => string;
  readingFrom: string;
  readingTo: string;
  readingsTab: 'chart' | 'table';
  selectedMeterId: string;
  meterOptions: MeterOption[];
  filteredReadings: Reading[];
  chartSeries: Array<{ name: string; data: number[] }>;
  chartOptions: Record<string, any>;
  readingsLoading: boolean;
  readingsEmpty: boolean;
  readingsFilteredEmpty: boolean;
  hasChartData: boolean;
  canEditReadings: boolean;
  onReadingFromChange: (value: string) => void;
  onReadingToChange: (value: string) => void;
  onSelectedMeterChange: (value: string) => void;
  onReadingsTabChange: (value: 'chart' | 'table') => void;
  onOpenEditDialog: (reading: Reading, index: number) => void;
  formatMeterLabel: (meter: MeterOption) => string;
};

export default function AccountReadingHistory({
  t,
  readingFrom,
  readingTo,
  readingsTab,
  selectedMeterId,
  meterOptions,
  filteredReadings,
  chartSeries,
  chartOptions,
  readingsLoading,
  readingsEmpty,
  readingsFilteredEmpty,
  hasChartData,
  canEditReadings,
  onReadingFromChange,
  onReadingToChange,
  onSelectedMeterChange,
  onReadingsTabChange,
  onOpenEditDialog,
  formatMeterLabel,
}: Props) {
  const renderReadingsContent = (content: ReactNode) => {
    if (readingsLoading) return <Typography variant="body2">{t('accounts.readings.loading')}</Typography>;
    if (readingsEmpty || readingsFilteredEmpty)
      return <Typography variant="body2">{t('accounts.readings.empty')}</Typography>;
    return content;
  };

  return (
    <Grid size={{ xs: 12, md: 8 }}>
      <Card>
        <CardHeader title={t('accounts.readings.title')} />
        <CardContent>
          <Stack direction="row" spacing={2} mb={2}>
            <TextField
              label={t('accounts.readings.filters.from')}
              type="date"
              value={readingFrom}
              onChange={(event) => onReadingFromChange(event.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{ minWidth: 160 }}
            />
            <TextField
              label={t('accounts.readings.filters.to')}
              type="date"
              value={readingTo}
              onChange={(event) => onReadingToChange(event.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{ minWidth: 160 }}
            />
            <TextField
              select
              label={t('accounts.readings.filters.meter')}
              value={selectedMeterId}
              onChange={(event) => onSelectedMeterChange(event.target.value)}
              sx={{ minWidth: 220 }}
              disabled={!meterOptions.length}
            >
              {meterOptions.map((meter) => (
                <MenuItem key={meter.id} value={meter.id}>
                  {formatMeterLabel(meter)}
                </MenuItem>
              ))}
            </TextField>
          </Stack>

          <Tabs value={readingsTab} onChange={(_, value) => onReadingsTabChange(value)} sx={{ mb: 2 }}>
            <Tab value="chart" label={t('accounts.common.chart')} />
            <Tab value="table" label={t('accounts.common.table')} />
          </Tabs>

          {readingsTab === 'chart' &&
            renderReadingsContent(
              hasChartData ? (
                <ChartWrapper type="bar" series={chartSeries} options={chartOptions} height={360} />
              ) : (
                <Typography variant="body2">{t('accounts.readings.chart.emptyHint')}</Typography>
              )
            )}

          {readingsTab === 'table' &&
            renderReadingsContent(
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ width: 140 }}>{t('accounts.readings.table.date')}</TableCell>
                      <TableCell sx={{ width: 140 }}>{t('accounts.readings.table.method')}</TableCell>
                      <TableCell sx={{ width: 120 }}>{t('accounts.readings.table.value')}</TableCell>
                      <TableCell sx={{ width: 140 }}>{t('accounts.readings.table.consumption')}</TableCell>
                      <TableCell sx={{ width: 200 }}>{t('accounts.readings.table.edited')}</TableCell>
                      <TableCell>{t('accounts.readings.table.meter')}</TableCell>
                      <TableCell sx={{ width: 80 }}>{t('accounts.readings.table.actions')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredReadings.map((reading, index) => {
                      const prev = filteredReadings[index + 1];
                      const consumption = prev ? roundReadingValue(reading.value - prev.value) : undefined;
                      const latestEdit = reading.edits && reading.edits.length ? reading.edits[0] : undefined;
                      const editorName = latestEdit
                        ? [latestEdit.editorFirstName, latestEdit.editorLastName].filter(Boolean).join(' ')
                        : '';

                      return (
                        <TableRow key={reading.id}>
                          <TableCell sx={{ width: 140 }}>{reading.readAt?.slice(0, 10)}</TableCell>
                          <TableCell sx={{ width: 140 }}>{reading.method}</TableCell>
                          <TableCell sx={{ width: 120 }}>{formatReadingValue(reading.value)}</TableCell>
                          <TableCell sx={{ width: 140 }}>
                            {formatReadingValue(consumption)}
                          </TableCell>
                          <TableCell sx={{ width: 200 }}>
                            {latestEdit ? (
                              <Tooltip title={latestEdit.reason || t('accounts.readings.table.noReason')}>
                                <span>{editorName || '-'}</span>
                              </Tooltip>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell>{reading.meter?.serialNumber || reading.meterId}</TableCell>
                          <TableCell sx={{ width: 80 }}>
                            <IconButton
                              size="small"
                              disabled={!canEditReadings}
                              onClick={() => onOpenEditDialog(reading, index)}
                              aria-label={t('accounts.readings.actions.edit')}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
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
