export type DashboardSeries = {
  categories: string[];
  series: number[];
};

export type DashboardDonutSeries = {
  labels: string[];
  series: number[];
};

export type DashboardKpis = {
  metersTotal: number;
  metersActive: number;
  metersInactive: number;
  metersRemoved: number;
  pendingVerifications: number;
  readingsPending: number;
  readingsRejected: number;
  readingsLast30Days: number;
  invoicesDraft: number;
  invoicesIssued: number;
  invoicesPaid: number;
  invoicesWithFlags: number;
  jobsFailed: number;
  jobsRunning: number;
  consumptionThisMonth: number;
  issuesLast30Days: number;
};

export type DashboardCharts = {
  readingsByMonth: DashboardSeries;
  invoicesByStatus: DashboardDonutSeries;
  metersByStatus: DashboardDonutSeries;
  consumptionByMonth: DashboardSeries;
  issuesByGroup: DashboardSeries;
};

export type DashboardResponse = {
  kpis: DashboardKpis;
  charts: DashboardCharts;
};
