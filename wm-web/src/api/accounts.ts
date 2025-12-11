import { useMemo } from 'react';
import useSWR from 'swr';
import axiosInstance, { endpoints, fetcher } from 'src/utils/axios';
import { VerificationAuditEntry, VerificationStatus } from 'src/types/accounts';

export type AccountRow = {
  id: string;
  type: 'consumer' | 'staff';
  verificationStatus: VerificationStatus;
  createdAt?: string;
  updatedAt?: string;
  data: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    address: string;
    householdSize?: number;
    staffRole?: string;
  };
  verificationLog?: VerificationAuditEntry[];
};


export function useGetAccounts() {
  const URL = endpoints.accounts.list;

  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

  return useMemo(
    () => ({
      accounts: data?.accounts as AccountRow[] || [],
      accountsLoading: isLoading,
      accountsError: error,
      accountsValidating: isValidating,
      accountsEmpty: !isLoading && !data?.accounts.length,
      mutate,
    }),
    [data?.accounts, error, isLoading, isValidating, mutate]
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
};
