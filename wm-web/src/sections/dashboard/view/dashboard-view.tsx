"use client";

import { useMemo } from 'react';
import {
  Alert,
  Card,
  CardContent,
  CardHeader,
  Container,
  Stack,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { useGetDashboardData } from 'src/api/dashboard';
import { ChartWrapper, useChart } from 'src/components/chart';
import { useLocales } from 'src/locales';
import { useAuthContext } from 'src/auth/hooks';
import { PERMISSIONS } from 'src/constants/permissions';

const formatValue = (value: number) => new Intl.NumberFormat().format(value);
const normalizeLabel = (value: string) => value.trim().toLowerCase().replace(/\s+/g, '_');

type DashboardKpiView = 'admin' | 'staff_backoffice' | 'manager';

const resolveKpiView = (permissions?: string[]) => {
  if (!permissions?.length) return null;
  if (permissions.includes(PERMISSIONS.DASHBOARD_KPIS_ADMIN)) return 'admin';
  if (permissions.includes(PERMISSIONS.DASHBOARD_KPIS_BACKOFFICE)) return 'staff_backoffice';
  if (permissions.includes(PERMISSIONS.DASHBOARD_KPIS_MANAGER)) return 'manager';
  return null;
};

const buildCards = (
  view: DashboardKpiView,
  kpis: Record<string, number>,
  t: (key: string) => string
) => {
  if (view === 'admin') {
    return [
      { label: t('dashboard.kpis.totalMeters'), value: kpis.metersTotal },
      { label: t('dashboard.kpis.activeMeters'), value: kpis.metersActive },
      { label: t('dashboard.kpis.pendingVerifications'), value: kpis.pendingVerifications },
      { label: t('dashboard.kpis.pendingReadings'), value: kpis.readingsPending },
      { label: t('dashboard.kpis.invoicesDraft'), value: kpis.invoicesDraft },
      { label: t('dashboard.kpis.invoicesFlagged'), value: kpis.invoicesWithFlags },
      { label: t('dashboard.kpis.jobFailures30d'), value: kpis.jobsFailed },
      { label: t('dashboard.kpis.readings30d'), value: kpis.readingsLast30Days },
    ];
  }

  if (view === 'staff_backoffice') {
    return [
      { label: t('dashboard.kpis.pendingApprovals'), value: kpis.pendingVerifications },
      { label: t('dashboard.kpis.pendingReadings'), value: kpis.readingsPending },
      { label: t('dashboard.kpis.rejectedReadings'), value: kpis.readingsRejected },
      { label: t('dashboard.kpis.invoicesDraft'), value: kpis.invoicesDraft },
      { label: t('dashboard.kpis.invoicesFlagged'), value: kpis.invoicesWithFlags },
      { label: t('dashboard.kpis.readings30d'), value: kpis.readingsLast30Days },
      { label: t('dashboard.kpis.activeMeters'), value: kpis.metersActive },
      { label: t('dashboard.kpis.inactiveMeters'), value: kpis.metersInactive },
    ];
  }

  return [
    { label: t('dashboard.kpis.activeMeters'), value: kpis.metersActive },
    { label: t('dashboard.kpis.inactiveMeters'), value: kpis.metersInactive },
    { label: t('dashboard.kpis.removedMeters'), value: kpis.metersRemoved },
    { label: t('dashboard.kpis.issues30d'), value: kpis.issuesLast30Days },
    { label: t('dashboard.kpis.consumptionMonth'), value: kpis.consumptionThisMonth },
    { label: t('dashboard.kpis.invoicesIssued'), value: kpis.invoicesIssued },
    { label: t('dashboard.kpis.invoicesPaid'), value: kpis.invoicesPaid },
    { label: t('dashboard.kpis.jobFailures30d'), value: kpis.jobsFailed },
  ];
};

export function DashboardView() {
  const { t } = useLocales();
  const { user } = useAuthContext();
  const { dashboard, dashboardLoading, dashboardError } = useGetDashboardData();

  const kpis = dashboard?.kpis;
  const charts = dashboard?.charts;
  const currentPermissions = (user as any)?.permissions as string[] | undefined;
  const hasPermission = (permission: string) => currentPermissions?.includes(permission) ?? false;
  const kpiView = resolveKpiView(currentPermissions);
  const showReadingsChart = hasPermission(PERMISSIONS.DASHBOARD_CHARTS_READINGS);
  const showInvoicesChart = hasPermission(PERMISSIONS.DASHBOARD_CHARTS_INVOICES);
  const showMetersChart = hasPermission(PERMISSIONS.DASHBOARD_CHARTS_METERS);
  const showConsumptionChart = hasPermission(PERMISSIONS.DASHBOARD_CHARTS_CONSUMPTION);
  const showIssuesChart = hasPermission(PERMISSIONS.DASHBOARD_CHARTS_ISSUES);
  const showCharts =
    showReadingsChart ||
    showInvoicesChart ||
    showMetersChart ||
    showConsumptionChart ||
    showIssuesChart;

  const readingsChartOptions = useChart(
    useMemo(
      () => ({
        xaxis: { categories: charts?.readingsByMonth.categories || [] },
        stroke: { width: 2 },
      }),
      [charts?.readingsByMonth.categories]
    )
  );

  const readingsSeries = useMemo(
    () => [{ name: t('dashboard.charts.readings'), data: charts?.readingsByMonth.series || [] }],
    [charts?.readingsByMonth.series, t]
  );

  const invoiceLabels = useMemo(() => {
    const map: Record<string, string> = {
      draft: t('billing.status.draft'),
      confirmed: t('billing.status.confirmed'),
      issued: t('billing.status.issued'),
      paid: t('billing.status.paid'),
      void: t('billing.status.void'),
    };
    return (charts?.invoicesByStatus.labels || []).map((label) => map[normalizeLabel(label)] || label);
  }, [charts?.invoicesByStatus.labels, t]);

  const invoiceChartOptions = useChart(
    useMemo(
      () => ({
        labels: invoiceLabels,
        legend: { position: 'bottom' },
      }),
      [invoiceLabels]
    )
  );

  const invoiceSeries = useMemo(() => charts?.invoicesByStatus.series || [], [charts?.invoicesByStatus.series]);

  const metersLabels = useMemo(() => {
    const map: Record<string, string> = {
      active: t('meters.status.active'),
      inactive: t('meters.status.inactive'),
      removed: t('meters.status.removed'),
    };
    return (charts?.metersByStatus.labels || []).map((label) => map[normalizeLabel(label)] || label);
  }, [charts?.metersByStatus.labels, t]);

  const metersChartOptions = useChart(
    useMemo(
      () => ({
        labels: metersLabels,
        legend: { position: 'bottom' },
      }),
      [metersLabels]
    )
  );

  const metersSeries = useMemo(() => charts?.metersByStatus.series || [], [charts?.metersByStatus.series]);

  const consumptionChartOptions = useChart(
    useMemo(
      () => ({
        xaxis: { categories: charts?.consumptionByMonth.categories || [] },
        stroke: { width: 2 },
      }),
      [charts?.consumptionByMonth.categories]
    )
  );

  const consumptionSeries = useMemo(
    () => [{ name: t('dashboard.charts.consumption'), data: charts?.consumptionByMonth.series || [] }],
    [charts?.consumptionByMonth.series, t]
  );

  const issuesChartOptions = useChart(
    useMemo(
      () => ({
        xaxis: { categories: charts?.issuesByGroup.categories || [] },
        plotOptions: { bar: { horizontal: false, columnWidth: '45%' } },
      }),
      [charts?.issuesByGroup.categories]
    )
  );

  const issuesSeries = useMemo(
    () => [{ name: t('dashboard.charts.issues'), data: charts?.issuesByGroup.series || [] }],
    [charts?.issuesByGroup.series, t]
  );

  if (dashboardLoading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="body2">{t('dashboard.loading')}</Typography>
      </Container>
    );
  }

  if (dashboardError || !dashboard || !kpis || !charts) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error">{t('dashboard.error')}</Alert>
      </Container>
    );
  }

  const cards = kpiView ? buildCards(kpiView, kpis as Record<string, number>, t) : [];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack spacing={3}>
        {cards.length > 0 && (
          <Grid container spacing={3}>
            {cards.map((card) => (
              <Grid key={card.label} size={{ xs: 12, sm: 6, md: 3 }}>
                <Card>
                  <CardContent>
                    <Stack spacing={1}>
                      <Typography variant="body2" color="text.secondary">
                        {card.label}
                      </Typography>
                      <Typography variant="h4">{formatValue(card.value)}</Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {showCharts && (
          <Grid container spacing={3}>
            {showReadingsChart && (
              <Grid size={{ xs: 12, md: 7 }}>
                <Card>
                  <CardHeader title={t('dashboard.charts.readingsVolume')} subheader={t('dashboard.charts.last6Months')} />
                  <CardContent>
                    <ChartWrapper type="line" series={readingsSeries} options={readingsChartOptions} height={320} />
                  </CardContent>
                </Card>
              </Grid>
            )}
            {showConsumptionChart && (
              <Grid size={{ xs: 12, md: 7 }}>
                <Card>
                  <CardHeader title={t('dashboard.charts.consumptionTrend')} subheader={t('dashboard.charts.last6Months')} />
                  <CardContent>
                    <ChartWrapper type="line" series={consumptionSeries} options={consumptionChartOptions} height={320} />
                  </CardContent>
                </Card>
              </Grid>
            )}
            {showIssuesChart && (
              <Grid size={{ xs: 12, md: 5 }}>
                <Card>
                  <CardHeader title={t('dashboard.charts.issuesByGroup')} subheader={t('dashboard.charts.last30Days')} />
                  <CardContent>
                    <ChartWrapper type="bar" series={issuesSeries} options={issuesChartOptions} height={320} />
                  </CardContent>
                </Card>
              </Grid>
            )}
            {showInvoicesChart && (
              <Grid size={{ xs: 12, md: 5 }}>
                <Card>
                  <CardHeader title={t('dashboard.charts.invoicesByStatus')} />
                  <CardContent>
                    <ChartWrapper type="donut" series={invoiceSeries} options={invoiceChartOptions} height={320} />
                  </CardContent>
                </Card>
              </Grid>
            )}
            {showMetersChart && (
              <Grid size={{ xs: 12, md: 5 }}>
                <Card>
                  <CardHeader title={t('dashboard.charts.metersByStatus')} />
                  <CardContent>
                    <ChartWrapper type="donut" series={metersSeries} options={metersChartOptions} height={320} />
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        )}
      </Stack>
    </Container>
  );
}
