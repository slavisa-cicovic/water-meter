import { LoginApi } from "@src/api/auth/login.api";
import { LoginInput, LoginResult } from "@src/api/types/auth";
import { defaultLocale, normalizeLocale, translations } from "@src/constants/translations";
import { useAuthStore } from "@src/state/auth-store";
import { useLocaleStore } from "@src/state/locale-store";

type ServiceResult<T> =
  | { success: true; data: T }
  | { success: false; message: string; details?: Record<string, string[]> };

const ERROR_MESSAGE_KEYS: Record<string, string> = {
  MISSING_CREDENTIALS: "auth.login.missingCredentials",
  ACCOUNT_NOT_FOUND: "auth.login.accountNotFound",
  INVALID_CREDENTIALS: "auth.login.invalidCredentials",
};

const translate = (key: string, fallback: string) => {
  const locale = useLocaleStore.getState().locale;
  return translations[locale]?.[key] ?? translations[defaultLocale]?.[key] ?? fallback;
};

export const LoginService = {
  async login(input: LoginInput): Promise<ServiceResult<LoginResult>> {
    try {
      const res = await LoginApi.login(input);
      if (!res.success) {
        const message = res.error
          ? translate(ERROR_MESSAGE_KEYS[res.error] || "auth.login.failed", "Login failed.")
          : translate("auth.login.failed", "Login failed.");
        return { success: false, message, details: res.details };
      }

      const data = res.data as LoginResult | undefined;
      if (!data?.accessToken) {
        return { success: false, message: translate("auth.login.invalidResponse", "Invalid login response.") };
      }

      await useAuthStore.getState().setSession(data.accessToken, data.user);
      if (data.user?.locale) {
        useLocaleStore.getState().setLocale(normalizeLocale(data.user.locale));
      }

      return { success: true, data };
    } catch (error: any) {
      const message = error?.response?.data?.error
        ? translate(
            ERROR_MESSAGE_KEYS[error.response.data.error] || "auth.login.failed",
            "Login failed."
          )
        : translate("auth.login.unable", "Unable to login. Please try again.");
      return { success: false, message };
    }
  },
};
