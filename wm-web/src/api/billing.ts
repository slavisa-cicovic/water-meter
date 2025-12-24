import { useMemo } from 'react';
import useSWR from 'swr';
import { endpoints, fetcher } from 'src/utils/axios';
import { Invoice } from 'src/types/billings';

type BillingQuery = {
  accountId?: string;
  meterId?: string;
  createdStart?: string;
  createdEnd?: string;
  status?: string;
  reviewFlags?: string[];
  orderBy?: string;
  order?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
};

export function useGetInvoices(params?: BillingQuery) {
  const query = new URLSearchParams();
  if (params?.accountId) query.set('accountId', params.accountId);
  if (params?.meterId) query.set('meterId', params.meterId);
  if (params?.createdStart) query.set('createdStart', params.createdStart);
  if (params?.createdEnd) query.set('createdEnd', params.createdEnd);
  if (params?.status) query.set('status', params.status);
  if (params?.reviewFlags?.length) query.set('reviewFlags', params.reviewFlags.join(','));
  if (params?.orderBy) query.set('orderBy', params.orderBy);
  if (params?.order) query.set('order', params.order);
  if (params?.page !== undefined) query.set('page', String(params.page));
  if (params?.pageSize !== undefined) query.set('pageSize', String(params.pageSize));

  const URL = params ? `${endpoints.billing.list}?${query.toString()}` : endpoints.billing.list;
  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

  return useMemo(
    () => ({
      invoices: (data?.invoices as Invoice[]) || [],
      total: (data?.total as number) || 0,
      invoicesLoading: isLoading,
      invoicesError: error,
      invoicesValidating: isValidating,
      invoicesEmpty: !isLoading && !data?.invoices?.length,
      mutate,
    }),
    [data?.invoices, data?.total, error, isLoading, isValidating, mutate]
  );
}

export function useGetInvoice(id?: string) {
  const URL = id ? endpoints.billing.details(id) : null;
  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

  return useMemo(
    () => ({
      invoice: data?.invoice as Invoice | undefined,
      invoiceLoading: isLoading,
      invoiceError: error,
      invoiceValidating: isValidating,
      mutate,
    }),
    [data?.invoice, error, isLoading, isValidating, mutate]
  );
}
