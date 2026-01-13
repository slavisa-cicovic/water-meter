import { Prisma } from '@prisma/client';
import { addMonths, format, startOfMonth, subDays, subMonths } from 'date-fns';
import prisma from 'src/utils/prisma';
import { DashboardCharts, DashboardKpis, DashboardResponse } from 'src/types/dashboard';

const METER_STATUSES = ['active', 'inactive', 'removed'] as const;
const INVOICE_STATUSES = ['draft', 'confirmed', 'issued', 'paid', 'void'] as const;

const buildMonthBuckets = (months: number) => {
  const now = new Date();
  const first = startOfMonth(subMonths(now, months - 1));
  return Array.from({ length: months }, (_, index) => {
    const start = addMonths(first, index);
    const end = addMonths(start, 1);
    return {
      key: `${start.getFullYear()}-${start.getMonth()}`,
      label: format(start, 'MMM yyyy'),
      start,
      end,
    };
  });
};

const buildSeriesFromBuckets = (buckets: ReturnType<typeof buildMonthBuckets>, dates: Date[]) => {
  const counts = new Map(buckets.map((bucket) => [bucket.key, 0]));
  dates.forEach((date) => {
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const current = counts.get(key);
    if (current === undefined) return;
    counts.set(key, current + 1);
  });
  return {
    categories: buckets.map((bucket) => bucket.label),
    series: buckets.map((bucket) => counts.get(bucket.key) || 0),
  };
};

const buildSumSeriesFromBuckets = (
  buckets: ReturnType<typeof buildMonthBuckets>,
  items: Array<{ date: Date; value: number | null }>
) => {
  const totals = new Map(buckets.map((bucket) => [bucket.key, 0]));
  items.forEach((item) => {
    if (!Number.isFinite(item.value)) return;
    const key = `${item.date.getFullYear()}-${item.date.getMonth()}`;
    const current = totals.get(key);
    if (current === undefined) return;
    totals.set(key, current + Number(item.value));
  });
  return {
    categories: buckets.map((bucket) => bucket.label),
    series: buckets.map((bucket) => totals.get(bucket.key) || 0),
  };
};

export const DashboardService = {
  async getDashboardData() : Promise<DashboardResponse> {
    const now = new Date();
    const last30Days = subDays(now, 30);
    const monthBuckets = buildMonthBuckets(6);
    const monthStart = monthBuckets[0]?.start ?? startOfMonth(now);
    const monthEnd = monthBuckets[monthBuckets.length - 1]?.end ?? addMonths(monthStart, 1);

    const emptyFlags = [] as Prisma.InputJsonValue;

    const [
      meterStatusCounts,
      invoiceStatusCounts,
      pendingVerifications,
      readingsPending,
      readingsRejected,
      readingsLast30Days,
      invoicesWithFlags,
      jobsFailed,
      jobsRunning,
      consumptionAggregate,
      readingsForChart,
      invoicesForChart,
      issueReadings,
    ] = await Promise.all([
      prisma.meter.groupBy({ by: ['status'], _count: { _all: true } }),
      prisma.invoice.groupBy({ by: ['status'], _count: { _all: true } }),
      prisma.account.count({ where: { verificationStatus: 'pending' } }),
      prisma.reading.count({ where: { barcodeStatus: 'pending' } }),
      prisma.reading.count({ where: { barcodeStatus: 'rejected' } }),
      prisma.reading.count({ where: { readAt: { gte: last30Days } } }),
      prisma.invoice.count({
        where: {
          NOT: [{ reviewFlags: { equals: Prisma.DbNull } }, { reviewFlags: { equals: emptyFlags } }],
        },
      }),
      prisma.jobRun.count({ where: { status: 'failed', runAt: { gte: last30Days } } }),
      prisma.jobRun.count({ where: { status: 'running' } }),
      prisma.invoice.aggregate({
        where: { createdAt: { gte: startOfMonth(now), lt: addMonths(startOfMonth(now), 1) } },
        _sum: { consumption: true },
      }),
      prisma.reading.findMany({
        where: { readAt: { gte: monthStart, lt: monthEnd } },
        select: { readAt: true },
      }),
      prisma.invoice.findMany({
        where: { createdAt: { gte: monthStart, lt: monthEnd } },
        select: { createdAt: true, consumption: true },
      }),
      prisma.reading.findMany({
        where: {
          barcodeStatus: { in: ['pending', 'rejected'] },
          readAt: { gte: last30Days },
        },
        select: { id: true, readAt: true, meter: { select: { groupCode: true } } },
      }),
    ]);

    const meterCounts = METER_STATUSES.reduce(
      (acc, status) => {
        const entry = meterStatusCounts.find((item) => item.status === status);
        acc[status] = entry?._count._all || 0;
        return acc;
      },
      { active: 0, inactive: 0, removed: 0 } as Record<(typeof METER_STATUSES)[number], number>
    );

    const invoiceCounts = INVOICE_STATUSES.reduce(
      (acc, status) => {
        const entry = invoiceStatusCounts.find((item) => item.status === status);
        acc[status] = entry?._count._all || 0;
        return acc;
      },
      { draft: 0, confirmed: 0, issued: 0, paid: 0, void: 0 } as Record<(typeof INVOICE_STATUSES)[number], number>
    );

    const readingsByMonth = buildSeriesFromBuckets(
      monthBuckets,
      readingsForChart.map((item) => item.readAt)
    );
    const consumptionByMonth = buildSumSeriesFromBuckets(
      monthBuckets,
      invoicesForChart.map((item) => ({ date: item.createdAt, value: item.consumption }))
    );

    const issueCounts = new Map<string, number>();
    issueReadings.forEach((reading) => {
      const groupCode = reading.meter?.groupCode || 'Ungrouped';
      issueCounts.set(groupCode, (issueCounts.get(groupCode) || 0) + 1);
    });

    const issueEntries = Array.from(issueCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);

    const issuesByGroup = {
      categories: issueEntries.map(([label]) => label),
      series: issueEntries.map(([, value]) => value),
    };

    const kpis: DashboardKpis = {
      metersTotal: meterCounts.active + meterCounts.inactive + meterCounts.removed,
      metersActive: meterCounts.active,
      metersInactive: meterCounts.inactive,
      metersRemoved: meterCounts.removed,
      pendingVerifications,
      readingsPending,
      readingsRejected,
      readingsLast30Days,
      invoicesDraft: invoiceCounts.draft,
      invoicesIssued: invoiceCounts.issued,
      invoicesPaid: invoiceCounts.paid,
      invoicesWithFlags,
      jobsFailed,
      jobsRunning,
      consumptionThisMonth: Number(consumptionAggregate._sum.consumption) || 0,
      issuesLast30Days: issueReadings.length,
    };

    const charts: DashboardCharts = {
      readingsByMonth,
      invoicesByStatus: {
        labels: INVOICE_STATUSES.map((status) => status.replace('_', ' ')),
        series: INVOICE_STATUSES.map((status) => invoiceCounts[status]),
      },
      metersByStatus: {
        labels: METER_STATUSES.map((status) => status),
        series: METER_STATUSES.map((status) => meterCounts[status]),
      },
      consumptionByMonth,
      issuesByGroup,
    };

    return { kpis, charts };
  },
};
