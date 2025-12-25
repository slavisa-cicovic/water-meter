import { useMemo } from 'react';
import useSWR from 'swr';
import axiosInstance, { endpoints, fetcher } from 'src/utils/axios';
import { JobCreateInput, JobDefinition, JobListParams, JobRun, JobUpdateInput } from 'src/types/jobs';

export function useGetJobs(params?: JobListParams) {
  const query = new URLSearchParams();
  if (params?.search) query.set('search', params.search);
  if (params?.status) query.set('status', params.status);
  if (params?.orderBy) query.set('orderBy', params.orderBy);
  if (params?.order) query.set('order', params.order);
  if (params?.page !== undefined) query.set('page', String(params.page));
  if (params?.pageSize !== undefined) query.set('pageSize', String(params.pageSize));

  const URL = params ? `${endpoints.jobs.list}?${query.toString()}` : endpoints.jobs.list;
  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

  return useMemo(
    () => ({
      jobs: (data?.jobs as JobDefinition[]) || [],
      total: (data?.total as number) || 0,
      jobsLoading: isLoading,
      jobsError: error,
      jobsValidating: isValidating,
      jobsEmpty: !isLoading && !data?.jobs?.length,
      mutate,
    }),
    [data?.jobs, data?.total, error, isLoading, isValidating, mutate]
  );
}

export function useGetJobRuns(jobId?: string, limit = 10) {
  const URL = jobId ? `${endpoints.jobs.runs(jobId)}?limit=${limit}` : null;
  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

  return useMemo(
    () => ({
      runs: (data?.runs as JobRun[]) || [],
      runsLoading: isLoading,
      runsError: error,
      runsValidating: isValidating,
      mutate,
    }),
    [data?.runs, error, isLoading, isValidating, mutate]
  );
}

export const JobsApi = {
  async createJob(payload: JobCreateInput) {
    const res = await axiosInstance.post(endpoints.jobs.list, payload);
    return res.data;
  },
  async updateJob(id: string, payload: JobUpdateInput) {
    const res = await axiosInstance.put(endpoints.jobs.details(id), payload);
    return res.data;
  },
  async bulkUpdate(ids: string[], action: 'delete' | 'activate' | 'deactivate') {
    const res = await axiosInstance.patch(endpoints.jobs.list, { ids, action });
    return res.data;
  },
  async runJobNow(
    id: string,
    payload?: { dryRun?: boolean; overrideIssued?: boolean; overridePaid?: boolean }
  ) {
    const res = await axiosInstance.post(endpoints.jobs.run(id), payload ?? {});
    return res.data;
  },
};
