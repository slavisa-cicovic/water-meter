import { useMemo } from 'react';
import useSWR from 'swr';
import { endpoints, fetcher } from 'src/utils/axios';

type RoleLinksHealth = {
  ok: boolean;
  accountsWithoutRoles: number;
  rolesWithoutPermissions: number;
};

export function useGetRoleLinksHealth() {
  const { data, isLoading, error, isValidating, mutate } = useSWR(endpoints.health.roleLinks, fetcher, {
    shouldRetryOnError: false,
  });

  return useMemo(
    () => ({
      health: (data as RoleLinksHealth) || null,
      healthLoading: isLoading,
      healthError: error,
      healthValidating: isValidating,
      mutate,
    }),
    [data, error, isLoading, isValidating, mutate]
  );
}
