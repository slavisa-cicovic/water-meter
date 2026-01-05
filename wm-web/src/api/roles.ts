import { useMemo } from 'react';
import useSWR from 'swr';
import { endpoints, fetcher } from 'src/utils/axios';

type RoleItem = { slug: string; name: string };

export function useGetRoles() {
  const { data, isLoading, error, isValidating, mutate } = useSWR(endpoints.roles.list, fetcher, {
    shouldRetryOnError: false,
  });

  return useMemo(
    () => ({
      roles: (data?.roles as RoleItem[]) || [],
      rolesLoading: isLoading,
      rolesError: error,
      rolesValidating: isValidating,
      mutate,
    }),
    [data?.roles, error, isLoading, isValidating, mutate]
  );
}
