import { LoginApi } from "@src/api/auth/login.api";
import { LoginInput, LoginResult } from "@src/api/types/auth";
import { useAuthStore } from "@src/state/auth-store";

type ServiceResult<T> =
  | { success: true; data: T }
  | { success: false; message: string; details?: Record<string, string[]> };

const ERROR_MESSAGES: Record<string, string> = {
  MISSING_CREDENTIALS: "Please enter your email/phone and password.",
  ACCOUNT_NOT_FOUND: "Account not found.",
  INVALID_CREDENTIALS: "Invalid credentials.",
};

export const LoginService = {
  async login(input: LoginInput): Promise<ServiceResult<LoginResult>> {
    try {
      const res = await LoginApi.login(input);
      if (!res.success) {
        const message = (res.error && ERROR_MESSAGES[res.error]) || "Login failed.";
        return { success: false, message, details: res.details };
      }

      const data = res.data as LoginResult | undefined;
      if (!data?.accessToken) {
        return { success: false, message: "Invalid login response." };
      }

      await useAuthStore.getState().setSession(data.accessToken, data.user);

      return { success: true, data };
    } catch (error: any) {
      const message = error?.response?.data?.error
        ? ERROR_MESSAGES[error.response.data.error] || "Login failed."
        : "Unable to login. Please try again.";
      return { success: false, message };
    }
  },
};
