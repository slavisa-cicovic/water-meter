import { useMemo } from 'react';
import useSWR from 'swr';
import axiosInstance, { endpoints, fetcher } from 'src/utils/axios';
import { AccountRow, AccountUpdateInput, VerificationStatus } from 'src/types/accounts';

type AccountsQuery = {
  search?: string;
  orderBy?: string;
  order?: 'asc' | 'desc';
  type?: 'consumer' | 'staff' | 'admin' | 'staff_backoffice' | 'staff_field';
  status?: string;
  page?: number;
  pageSize?: number;
};

export function useGetAccounts(params?: AccountsQuery) {
  const query = new URLSearchParams();
  if (params?.search) query.set('search', params.search);
  if (params?.orderBy) query.set('orderBy', params.orderBy);
  if (params?.order) query.set('order', params.order);
  if (params?.type) query.set('type', params.type);
  if (params?.status) query.set('status', params.status);
   if (params?.page !== undefined) query.set('page', String(params.page));
   if (params?.pageSize !== undefined) query.set('pageSize', String(params.pageSize));

  const URL = params ? `${endpoints.accounts.list}?${query.toString()}` : endpoints.accounts.list;

  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

  return useMemo(
    () => ({
      accounts: (data?.accounts as AccountRow[]) || [],
      total: data?.total as number || 0,
      accountsLoading: isLoading,
      accountsError: error,
      accountsValidating: isValidating,
      accountsEmpty: !isLoading && !data?.accounts?.length,
      mutate,
    }),
    [data?.accounts, data?.total, error, isLoading, isValidating, mutate]
  );
}

export function useGetAccount(id?: string) {
  const URL = id ? `${endpoints.accounts.details(id)}` : null;

  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

  const account = data?.data;

  return {
    account: data?.account as AccountRow,
    accountLoading: isLoading,
    accountError: error,
    accountValidating: isValidating,
    mutate,
  };
}

export const AccountsApi = {
  async verify(accountId: string, status: VerificationStatus) {
    await axiosInstance.post(endpoints.accounts.verify, {
      accountId,
      status,
      reviewerId: 'backoffice-user',
    });
  },

  async updateAccount(id: string, payload: AccountUpdateInput) {
    const res = await axiosInstance.put(endpoints.accounts.details(id), payload);
    return res.data;
  },
};
