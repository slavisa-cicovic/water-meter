import { useMemo } from 'react';
import useSWR from 'swr';
import axiosInstance, { endpoints, fetcher } from 'src/utils/axios';
import { RoleWithPermissions } from 'src/types/roles';

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

export function useGetRolesWithPermissions() {
  const { data, isLoading, error, isValidating, mutate } = useSWR(
    `${endpoints.roles.list}?includePermissions=1`,
    fetcher,
    {
      shouldRetryOnError: false,
    }
  );

  return useMemo(
    () => ({
      roles: (data?.roles as RoleWithPermissions[]) || [],
      rolesLoading: isLoading,
      rolesError: error,
      rolesValidating: isValidating,
      mutate,
    }),
    [data?.roles, error, isLoading, isValidating, mutate]
  );
}

export const RolesApi = {
  async createRole(payload: { slug: string; name: string; description?: string | null }) {
    const res = await axiosInstance.post(endpoints.roles.list, payload);
    return res.data;
  },
  async updateRolePermissions(roleId: string, updates: { permissionSlug: string; enabled: boolean; conditions?: any }[]) {
    const res = await axiosInstance.patch(endpoints.roles.permissions(roleId), { updates });
    return res.data;
  },
};
