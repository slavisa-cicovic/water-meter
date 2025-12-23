import { useMemo } from 'react';
import useSWR from 'swr';
import axiosInstance, { endpoints, fetcher } from 'src/utils/axios';
import { Reading, ReadingCreateInput } from 'src/types/readings';

type ReadingsQuery = {
  meterId?: string;
  accountId?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
};

export function useGetReadings(params?: ReadingsQuery) {
  const query = new URLSearchParams();
  if (params?.meterId) query.set('meterId', params.meterId);
  if (params?.accountId) query.set('accountId', params.accountId);
  if (params?.from) query.set('from', params.from);
  if (params?.to) query.set('to', params.to);
  if (params?.page !== undefined) query.set('page', String(params.page));
  if (params?.pageSize !== undefined) query.set('pageSize', String(params.pageSize));

  const URL = params ? `${endpoints.readings.list}?${query.toString()}` : endpoints.readings.list;
  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

  return useMemo(
    () => ({
      readings: (data?.readings as Reading[]) || [],
      total: (data?.total as number) || 0,
      readingsLoading: isLoading,
      readingsError: error,
      readingsValidating: isValidating,
      readingsEmpty: !isLoading && !data?.readings?.length,
      mutate,
    }),
    [data?.readings, data?.total, error, isLoading, isValidating, mutate]
  );
}

export const ReadingsApi = {
  async createReading(payload: ReadingCreateInput) {
    const res = await axiosInstance.post(endpoints.readings.list, payload);
    return res.data;
  },
};
