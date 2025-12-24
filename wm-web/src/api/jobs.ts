import { useMemo } from 'react';
import useSWR from 'swr';
import axiosInstance, { endpoints, fetcher } from 'src/utils/axios';
import { JobCreateInput, JobDefinition, JobUpdateInput } from 'src/types/jobs';

export function useGetJobs() {
  const { data, isLoading, error, isValidating, mutate } = useSWR(endpoints.jobs.list, fetcher);

  return useMemo(
    () => ({
      jobs: (data?.jobs as JobDefinition[]) || [],
      jobsLoading: isLoading,
      jobsError: error,
      jobsValidating: isValidating,
      mutate,
    }),
    [data?.jobs, error, isLoading, isValidating, mutate]
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
  async runJobNow(id: string) {
    const res = await axiosInstance.post(endpoints.jobs.run(id));
    return res.data;
  },
};
