import { apiClient } from "@src/api/client";
import { ApiResponse } from "@src/api/types/accounts";
import { ForgotPasswordInput, ForgotPasswordResult } from "@src/api/types/auth";

export const ForgotPasswordApi = {
  request: async (payload: ForgotPasswordInput): Promise<ApiResponse<ForgotPasswordResult>> => {
    const res = await apiClient.post<ApiResponse<ForgotPasswordResult>>(
      "/api/auth/forgot-password",
      payload
    );
    return res.data;
  },
};
