import { useMemo } from 'react';
import useSWR from 'swr';
import { endpoints, fetcher } from 'src/utils/axios';

export type NotificationsSummary = {
  reviewFlags: Record<string, number>;
  draftInvoices: number;
  suppressed?: boolean;
};

export function useGetNotifications() {
  const { data, isLoading, error, isValidating, mutate } = useSWR(endpoints.notifications.summary, fetcher, {
    revalidateOnFocus: true,
    refreshInterval: 3600000,
  });

  return useMemo(
    () => ({
      summary: data as NotificationsSummary | undefined,
      notificationsLoading: isLoading,
      notificationsError: error,
      notificationsValidating: isValidating,
      mutate,
    }),
    [data, error, isLoading, isValidating, mutate]
  );
}
