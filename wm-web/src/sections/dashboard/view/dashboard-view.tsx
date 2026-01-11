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
import { DashboardRole } from 'src/types/dashboard';

const formatValue = (value: number) => new Intl.NumberFormat().format(value);

const buildCards = (role: DashboardRole, kpis: Record<string, number>) => {
  if (role === 'admin') {
    return [
      { label: 'Total meters', value: kpis.metersTotal },
      { label: 'Active meters', value: kpis.metersActive },
      { label: 'Pending verifications', value: kpis.pendingVerifications },
      { label: 'Pending readings', value: kpis.readingsPending },
      { label: 'Invoices draft', value: kpis.invoicesDraft },
      { label: 'Invoices flagged', value: kpis.invoicesWithFlags },
      { label: 'Job failures (30d)', value: kpis.jobsFailed },
      { label: 'Readings (30d)', value: kpis.readingsLast30Days },
    ];
  }

  if (role === 'staff_backoffice') {
    return [
      { label: 'Pending approvals', value: kpis.pendingVerifications },
      { label: 'Pending readings', value: kpis.readingsPending },
      { label: 'Rejected readings', value: kpis.readingsRejected },
      { label: 'Invoices draft', value: kpis.invoicesDraft },
      { label: 'Invoices flagged', value: kpis.invoicesWithFlags },
      { label: 'Readings (30d)', value: kpis.readingsLast30Days },
      { label: 'Active meters', value: kpis.metersActive },
      { label: 'Inactive meters', value: kpis.metersInactive },
    ];
  }

  return [
    { label: 'Active meters', value: kpis.metersActive },
    { label: 'Inactive meters', value: kpis.metersInactive },
    { label: 'Removed meters', value: kpis.metersRemoved },
    { label: 'Issues (30d)', value: kpis.issuesLast30Days },
    { label: 'Consumption (month)', value: kpis.consumptionThisMonth },
    { label: 'Invoices issued', value: kpis.invoicesIssued },
    { label: 'Invoices paid', value: kpis.invoicesPaid },
    { label: 'Job failures (30d)', value: kpis.jobsFailed },
  ];
};

export function DashboardView() {
  const { dashboard, dashboardLoading, dashboardError } = useGetDashboardData();

  const role = dashboard?.role;
  const kpis = dashboard?.kpis;
  const charts = dashboard?.charts;

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
    () => [{ name: 'Readings', data: charts?.readingsByMonth.series || [] }],
    [charts?.readingsByMonth.series]
  );

  const invoiceChartOptions = useChart(
    useMemo(
      () => ({
        labels: charts?.invoicesByStatus.labels || [],
        legend: { position: 'bottom' },
      }),
      [charts?.invoicesByStatus.labels]
    )
  );

  const invoiceSeries = useMemo(() => charts?.invoicesByStatus.series || [], [charts?.invoicesByStatus.series]);

  const metersChartOptions = useChart(
    useMemo(
      () => ({
        labels: charts?.metersByStatus.labels || [],
        legend: { position: 'bottom' },
      }),
      [charts?.metersByStatus.labels]
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
    () => [{ name: 'Consumption', data: charts?.consumptionByMonth.series || [] }],
    [charts?.consumptionByMonth.series]
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
    () => [{ name: 'Issues', data: charts?.issuesByGroup.series || [] }],
    [charts?.issuesByGroup.series]
  );

  if (dashboardLoading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="body2">Loading dashboard...</Typography>
      </Container>
    );
  }

  if (dashboardError || !dashboard || !role || !kpis || !charts) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error">Dashboard data is unavailable.</Alert>
      </Container>
    );
  }

  const cards = buildCards(role, kpis as Record<string, number>);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Grid container spacing={3}>
          {cards.map((card) => (
            <Grid key={card.label} xs={12} sm={6} md={3}>
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

        {(role === 'admin' || role === 'staff_backoffice') && (
          <Grid container spacing={3}>
            <Grid xs={12} md={7}>
              <Card>
                <CardHeader title="Readings volume" subheader="Last 6 months" />
                <CardContent>
                  <ChartWrapper type="line" series={readingsSeries} options={readingsChartOptions} height={320} />
                </CardContent>
              </Card>
            </Grid>
            <Grid xs={12} md={5}>
              <Card>
                <CardHeader title="Invoices by status" />
                <CardContent>
                  <ChartWrapper type="donut" series={invoiceSeries} options={invoiceChartOptions} height={320} />
                </CardContent>
              </Card>
            </Grid>
            <Grid xs={12} md={5}>
              <Card>
                <CardHeader title="Meters by status" />
                <CardContent>
                  <ChartWrapper type="donut" series={metersSeries} options={metersChartOptions} height={320} />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {role === 'manager' && (
          <Grid container spacing={3}>
            <Grid xs={12} md={7}>
              <Card>
                <CardHeader title="Consumption trend" subheader="Last 6 months" />
                <CardContent>
                  <ChartWrapper type="line" series={consumptionSeries} options={consumptionChartOptions} height={320} />
                </CardContent>
              </Card>
            </Grid>
            <Grid xs={12} md={5}>
              <Card>
                <CardHeader title="Issues by group" subheader="Last 30 days" />
                <CardContent>
                  <ChartWrapper type="bar" series={issuesSeries} options={issuesChartOptions} height={320} />
                </CardContent>
              </Card>
            </Grid>
            <Grid xs={12} md={5}>
              <Card>
                <CardHeader title="Meters by status" />
                <CardContent>
                  <ChartWrapper type="donut" series={metersSeries} options={metersChartOptions} height={320} />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Stack>
    </Container>
  );
}
