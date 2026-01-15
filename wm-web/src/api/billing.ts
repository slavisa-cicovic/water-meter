import { useMemo } from 'react';
import useSWR from 'swr';
import axiosInstance, { endpoints, fetcher } from 'src/utils/axios';
import {
  Invoice,
  InvoiceLineItem,
  InvoiceLineItemCreateInput,
  InvoiceLineItemUpdateInput,
  Tariff,
  TariffCreateInput,
  TariffUpdateInput,
} from 'src/types/billings';

type BillingQuery = {
  accountId?: string;
  search?: string;
  createdStart?: string;
  createdEnd?: string;
  periodEndStart?: string;
  periodEndEnd?: string;
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
  if (params?.search) query.set('search', params.search);
  if (params?.createdStart) query.set('createdStart', params.createdStart);
  if (params?.createdEnd) query.set('createdEnd', params.createdEnd);
  if (params?.periodEndStart) query.set('periodEndStart', params.periodEndStart);
  if (params?.periodEndEnd) query.set('periodEndEnd', params.periodEndEnd);
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

export const BillingApi = {
  async confirmInvoices(ids: string[]) {
    const res = await axiosInstance.patch(endpoints.billing.list, {
      ids,
      status: 'confirmed',
    });
    return res.data;
  },
  async cancelInvoices(ids: string[]) {
    const res = await axiosInstance.patch(endpoints.billing.list, {
      ids,
      status: 'void',
    });
    return res.data;
  },
  async reviewInvoiceReadings(
    id: string,
    payload: {
      previous: { value: number; readAt: string };
      current: { value: number; readAt: string };
      reason: string;
      householdSize?: number;
    }
  ) {
    const res = await axiosInstance.patch(endpoints.billing.details(id), payload);
    return res.data;
  },
};

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

export function useGetTariffs() {
  const { data, isLoading, error, isValidating, mutate } = useSWR(endpoints.billing.tariffs, fetcher);

  return useMemo(
    () => ({
      tariffs: (data?.tariffs as Tariff[]) || [],
      tariffsLoading: isLoading,
      tariffsError: error,
      tariffsValidating: isValidating,
      tariffsEmpty: !isLoading && !data?.tariffs?.length,
      mutate,
    }),
    [data?.tariffs, error, isLoading, isValidating, mutate]
  );
}

export function useGetTariff(id?: string) {
  const URL = id ? endpoints.billing.tariffDetails(id) : null;
  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

  return useMemo(
    () => ({
      tariff: data?.tariff as Tariff | undefined,
      tariffLoading: isLoading,
      tariffError: error,
      tariffValidating: isValidating,
      mutate,
    }),
    [data?.tariff, error, isLoading, isValidating, mutate]
  );
}

export function useGetInvoiceLineItems() {
  const { data, isLoading, error, isValidating, mutate } = useSWR(endpoints.billing.lineItems, fetcher);

  return useMemo(
    () => ({
      lineItems: (data?.lineItems as InvoiceLineItem[]) || [],
      lineItemsLoading: isLoading,
      lineItemsError: error,
      lineItemsValidating: isValidating,
      lineItemsEmpty: !isLoading && !data?.lineItems?.length,
      mutate,
    }),
    [data?.lineItems, error, isLoading, isValidating, mutate]
  );
}

export function useGetInvoiceLineItem(id?: string) {
  const URL = id ? endpoints.billing.lineItemDetails(id) : null;
  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

  return useMemo(
    () => ({
      lineItem: data?.lineItem as InvoiceLineItem | undefined,
      lineItemLoading: isLoading,
      lineItemError: error,
      lineItemValidating: isValidating,
      mutate,
    }),
    [data?.lineItem, error, isLoading, isValidating, mutate]
  );
}

export const InvoiceLineItemsApi = {
  async createLineItem(payload: InvoiceLineItemCreateInput) {
    const res = await axiosInstance.post(endpoints.billing.lineItems, payload);
    return res.data;
  },
  async updateLineItem(payload: InvoiceLineItemUpdateInput) {
    const res = await axiosInstance.put(endpoints.billing.lineItemDetails(payload.id), payload);
    return res.data;
  },
};

export const TariffsApi = {
  async createTariff(payload: TariffCreateInput) {
    const res = await axiosInstance.post(endpoints.billing.tariffs, payload);
    return res.data;
  },
  async updateTariff(payload: TariffUpdateInput) {
    const res = await axiosInstance.put(endpoints.billing.tariffs, payload);
    return res.data;
  },
  async bulkUpdate(ids: string[], action: 'delete' | 'activate' | 'deactivate') {
    const res = await axiosInstance.patch(endpoints.billing.tariffs, { ids, action });
    return res.data;
  },
};
