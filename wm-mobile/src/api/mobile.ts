import { apiClient } from "@src/api/client";
import { ApiResponse } from "@src/api/types/accounts";
import { MobileAccountData, MobileProfileUpdateInput } from "@src/api/types/mobile";

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
};
