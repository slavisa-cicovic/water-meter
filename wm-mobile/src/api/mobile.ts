import { apiClient } from "@src/api/client";
import { ApiResponse } from "@src/api/types/accounts";
import {
  MobileAccountData,
  MobileBillingData,
  MobileConsumptionData,
  MobileProfileUpdateInput,
  MobileReadingContext,
  MobileReadingCreateInput,
  MobileReadingResult,
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
  getReadingContext: async (): Promise<ApiResponse<MobileReadingContext>> => {
    const res = await apiClient.get<ApiResponse<MobileReadingContext>>("/api/mobile/readings");
    return res.data;
  },
  createReading: async (
    payload: MobileReadingCreateInput
  ): Promise<ApiResponse<MobileReadingResult>> => {
    const res = await apiClient.post<ApiResponse<MobileReadingResult>>("/api/mobile/readings", payload);
    return res.data;
  },
};
