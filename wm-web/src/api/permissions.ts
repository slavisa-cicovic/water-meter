import { useMemo } from 'react';
import useSWR from 'swr';
import { endpoints, fetcher } from 'src/utils/axios';
import { PermissionItem } from 'src/types/roles';

export function useGetPermissions() {
  const { data, isLoading, error, isValidating, mutate } = useSWR(endpoints.permissions.list, fetcher, {
    shouldRetryOnError: false,
  });

  return useMemo(
    () => ({
      permissions: (data?.permissions as PermissionItem[]) || [],
      permissionsLoading: isLoading,
      permissionsError: error,
      permissionsValidating: isValidating,
      mutate,
    }),
    [data?.permissions, error, isLoading, isValidating, mutate]
  );
}
