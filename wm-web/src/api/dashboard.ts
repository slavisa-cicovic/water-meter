import { useMemo } from 'react';
import useSWR from 'swr';
import { endpoints, fetcher } from 'src/utils/axios';
import { DashboardResponse } from 'src/types/dashboard';

export function useGetDashboardData() {
  const { data, isLoading, error, isValidating, mutate } = useSWR(endpoints.dashboard.summary, fetcher);

  return useMemo(
    () => ({
      dashboard: data as DashboardResponse | undefined,
      dashboardLoading: isLoading,
      dashboardError: error,
      dashboardValidating: isValidating,
      mutate,
    }),
    [data, error, isLoading, isValidating, mutate]
  );
}
