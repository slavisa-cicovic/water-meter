import { ForgotPasswordApi } from "@src/api/auth/forgot-password.api";
import { ForgotPasswordInput, ForgotPasswordResult } from "@src/api/types/auth";

type ServiceResult<T> =
  | { success: true; data: T }
  | { success: false; message: string; details?: Record<string, string[]> };

const ERROR_MESSAGES: Record<string, string> = {
  MISSING_IDENTIFIER: "Please enter your email or phone.",
};

export const ForgotPasswordService = {
  async request(input: ForgotPasswordInput): Promise<ServiceResult<ForgotPasswordResult>> {
    try {
      const res = await ForgotPasswordApi.request(input);
      if (!res.success) {
        const message = (res.error && ERROR_MESSAGES[res.error]) || "Request failed.";
        return { success: false, message, details: res.details };
      }
      return { success: true, data: { success: true } };
    } catch (error: any) {
      const message = error?.response?.data?.error
        ? ERROR_MESSAGES[error.response.data.error] || "Request failed."
        : "Unable to send reset request. Please try again.";
      return { success: false, message };
    }
  },
};
