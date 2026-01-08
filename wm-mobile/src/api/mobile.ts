import { apiClient } from "@src/api/client";
import { ApiResponse } from "@src/api/types/accounts";
import {
  MobileAccountData,
  MobileBillingData,
  MobileConsumptionData,
  MobileProfileUpdateInput,
  MobileLocaleUpdateInput,
  MobileReadingContext,
  MobileReadingCreateInput,
  MobileReadingResult,
  MobilePaymentData,
  MobileNotificationsData,
  MobileStaffMetersData,
} from "@src/api/types/mobile";

export const MobileApi = {
  getAccount: async (): Promise<ApiResponse<MobileAccountData>> => {
    const res = await apiClient.get<ApiResponse<MobileAccountData>>("/api/mobile");
    return res.data;
  },
  updateProfile: async (
    payload: MobileProfileUpdateInput
  ): Promise<ApiResponse<MobileAccountData>> => {
    const res = await apiClient.put<ApiResponse<MobileAccountData>>("/api/mobile", payload);
    return res.data;
  },
  updateLocale: async (
    payload: MobileLocaleUpdateInput
  ): Promise<ApiResponse<MobileAccountData>> => {
    const res = await apiClient.put<ApiResponse<MobileAccountData>>("/api/mobile/locale", payload);
    return res.data;
  },
  getConsumption: async (year: number): Promise<ApiResponse<MobileConsumptionData>> => {
    const res = await apiClient.get<ApiResponse<MobileConsumptionData>>("/api/mobile/consumption", {
      params: { year },
    });
    return res.data;
  },
  getBilling: async (year: number): Promise<ApiResponse<MobileBillingData>> => {
    const res = await apiClient.get<ApiResponse<MobileBillingData>>("/api/mobile/billing", {
      params: { year },
    });
    return res.data;
  },
  getReadingContext: async (meterId?: string): Promise<ApiResponse<MobileReadingContext>> => {
    const res = await apiClient.get<ApiResponse<MobileReadingContext>>("/api/mobile/readings", {
      params: meterId ? { meterId } : undefined,
    });
    return res.data;
  },
  createReading: async (
    payload: MobileReadingCreateInput
  ): Promise<ApiResponse<MobileReadingResult>> => {
    const res = await apiClient.post<ApiResponse<MobileReadingResult>>("/api/mobile/readings", payload);
    return res.data;
  },
  getPayment: async (): Promise<ApiResponse<MobilePaymentData>> => {
    const res = await apiClient.get<ApiResponse<MobilePaymentData>>("/api/mobile/payments");
    return res.data;
  },
  payInvoice: async (invoiceId: string): Promise<ApiResponse<{ updated: number }>> => {
    const res = await apiClient.post<ApiResponse<{ updated: number }>>("/api/mobile/payments", {
      invoiceId,
    });
    return res.data;
  },
  getNotifications: async (): Promise<ApiResponse<MobileNotificationsData>> => {
    const res = await apiClient.get<ApiResponse<MobileNotificationsData>>("/api/mobile/notifications");
    return res.data;
  },
  getStaffMeters: async (): Promise<ApiResponse<MobileStaffMetersData>> => {
    const res = await apiClient.get<ApiResponse<MobileStaffMetersData>>("/api/mobile/meters");
    return res.data;
  },
};
