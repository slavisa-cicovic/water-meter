import { useMemo } from 'react';
import useSWR from 'swr';
import axiosInstance, { endpoints, fetcher } from 'src/utils/axios';
import { MessageThreadDetail, MessageThreadSummary } from 'src/types/messages';

type ThreadsResponse = { threads: MessageThreadSummary[] };
type ThreadResponse = MessageThreadDetail;

export const useGetMessageThreads = () => {
  const { data, isLoading, error, isValidating, mutate } = useSWR(endpoints.messages.root, fetcher);

  return useMemo(
    () => ({
      threads: (data as ThreadsResponse | undefined)?.threads ?? [],
      threadsLoading: isLoading,
      threadsError: error,
      threadsValidating: isValidating,
      mutate,
    }),
    [data, error, isLoading, isValidating, mutate]
  );
};

export const useGetMessageThread = (accountId?: string | null, params?: { limit?: number; before?: string }) => {
  const key = accountId ? [endpoints.messages.root, { params: { accountId, ...params } }] : null;
  const { data, isLoading, error, isValidating, mutate } = useSWR(key, fetcher);

  return useMemo(
    () => ({
      thread: (data as ThreadResponse | undefined) ?? null,
      threadLoading: isLoading,
      threadError: error,
      threadValidating: isValidating,
      mutate,
    }),
    [data, error, isLoading, isValidating, mutate]
  );
};

export const MessagesApi = {
  async sendMessage(accountId: string, body: string) {
    const res = await axiosInstance.post(endpoints.messages.root, { accountId, body });
    return res.data;
  },
  async updateAiEnabled(accountId: string, enabled: boolean) {
    const res = await axiosInstance.put(endpoints.messages.aiEnabled, { accountId, enabled });
    return res.data;
  },
};
