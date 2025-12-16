import { useMemo } from 'react';
import useSWR from 'swr';
import { endpoints, fetcher } from 'src/utils/axios';
import { Meter } from 'src/types/meters';

type MetersQuery = {
  search?: string;
  status?: string;
  groupCode?: string;
  consumerAccountId?: string;
  page?: number;
  pageSize?: number;
};

export function useGetMeters(params?: MetersQuery) {
  const query = new URLSearchParams();
  if (params?.search) query.set('search', params.search);
  if (params?.status) query.set('status', params.status);
  if (params?.groupCode) query.set('groupCode', params.groupCode);
  if (params?.consumerAccountId) query.set('consumerAccountId', params.consumerAccountId);
  if (params?.page !== undefined) query.set('page', String(params.page));
  if (params?.pageSize !== undefined) query.set('pageSize', String(params.pageSize));

  const URL = params ? `${endpoints.meters.list}?${query.toString()}` : endpoints.meters.list;

  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

  return useMemo(
    () => ({
      meters: (data?.meters as Meter[]) || [],
      total: (data?.total as number) || 0,
      metersLoading: isLoading,
      metersError: error,
      metersValidating: isValidating,
      metersEmpty: !isLoading && !data?.meters?.length,
      mutate,
    }),
    [data?.meters, data?.total, error, isLoading, isValidating, mutate]
  );
}

