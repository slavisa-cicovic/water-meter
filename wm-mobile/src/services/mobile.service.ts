import { MobileApi } from "@src/api/mobile";
import {
  MobileAccountData,
  MobileBillingData,
  MobileConsumptionData,
  MobileProfileUpdateInput,
  MobileReadingContext,
  MobileReadingCreateInput,
  MobileReadingResult,
  MobilePaymentData,
  MobileNotificationsData,
  MobileStaffMetersData,
} from "@src/api/types/mobile";
import { useAuthStore } from "@src/state/auth-store";
import { defaultLocale, normalizeLocale, translations } from "@src/constants/translations";
import { useLocaleStore } from "@src/state/locale-store";

type ServiceResult<T> =
  | { success: true; data: T }
  | { success: false; message: string; details?: Record<string, string[]> };

const ERROR_MESSAGE_KEYS: Record<string, string> = {
  UNAUTHORIZED: "errors.unauthorized",
  INVALID_TOKEN: "errors.invalidToken",
  VALIDATION_FAILED: "errors.validationFailed",
  ACCOUNT_EXISTS: "errors.accountExists",
  NOT_FOUND: "errors.notFound",
  READER_FORBIDDEN: "errors.readerForbidden",
  ACCOUNT_MISMATCH: "errors.accountMismatch",
  FORBIDDEN: "errors.readerForbidden",
};

const translate = (key: string, fallback: string) => {
  const locale = useLocaleStore.getState().locale;
  return translations[locale]?.[key] ?? translations[defaultLocale]?.[key] ?? fallback;
};

const updateAuthUser = (data: MobileAccountData) => {
  const { accessToken, user, setSession } = useAuthStore.getState();
  if (!accessToken || !user) return;
  setSession(accessToken, {
    ...user,
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    address: data.address,
    locale: data.locale ?? user.locale,
  });
};

const syncLocale = (locale?: string | null) => {
  if (!locale) return;
  const normalized = normalizeLocale(locale);
  useLocaleStore.getState().setLocale(normalized);
};

export const MobileService = {
  async getAccount(): Promise<ServiceResult<MobileAccountData>> {
    try {
      const res = await MobileApi.getAccount();
      if (!res.success) {
        const message = res.error
          ? translate(ERROR_MESSAGE_KEYS[res.error] || "errors.loadAccount", "Unable to load account.")
          : translate("errors.loadAccount", "Unable to load account.");
        return { success: false, message, details: res.details };
      }

      const data = res.data as MobileAccountData | undefined;
      if (!data) {
        return { success: false, message: translate("errors.invalidAccountResponse", "Invalid account response.") };
      }

      updateAuthUser(data);
      syncLocale(data.locale);
      return { success: true, data };
    } catch (error: any) {
      const message = error?.response?.data?.error
        ? translate(
            ERROR_MESSAGE_KEYS[error.response.data.error] || "errors.loadAccount",
            "Unable to load account."
          )
        : translate("errors.loadAccount", "Unable to load account.");
      return { success: false, message };
    }
  },

  async updateProfile(input: MobileProfileUpdateInput): Promise<ServiceResult<MobileAccountData>> {
    try {
      const res = await MobileApi.updateProfile(input);
      if (!res.success) {
        const message = res.error
          ? translate(ERROR_MESSAGE_KEYS[res.error] || "errors.updateProfile", "Unable to update profile.")
          : translate("errors.updateProfile", "Unable to update profile.");
        return { success: false, message, details: res.details };
      }

      const data = res.data as MobileAccountData | undefined;
      if (!data) {
        return { success: false, message: translate("errors.invalidProfileResponse", "Invalid profile response.") };
      }

      updateAuthUser(data);
      syncLocale(data.locale);
      return { success: true, data };
    } catch (error: any) {
      const message = error?.response?.data?.error
        ? translate(
            ERROR_MESSAGE_KEYS[error.response.data.error] || "errors.updateProfile",
            "Unable to update profile."
          )
        : translate("errors.updateProfile", "Unable to update profile.");
      return { success: false, message };
    }
  },

  async getConsumption(year: number): Promise<ServiceResult<MobileConsumptionData>> {
    try {
      const res = await MobileApi.getConsumption(year);
      if (!res.success) {
        const message = res.error
          ? translate(ERROR_MESSAGE_KEYS[res.error] || "errors.loadConsumption", "Unable to load consumption.")
          : translate("errors.loadConsumption", "Unable to load consumption.");
        return { success: false, message, details: res.details };
      }

      const data = res.data as MobileConsumptionData | undefined;
      if (!data) {
        return {
          success: false,
          message: translate("errors.invalidConsumptionResponse", "Invalid consumption response."),
        };
      }

      return { success: true, data };
    } catch (error: any) {
      const message = error?.response?.data?.error
        ? translate(
            ERROR_MESSAGE_KEYS[error.response.data.error] || "errors.loadConsumption",
            "Unable to load consumption."
          )
        : translate("errors.loadConsumption", "Unable to load consumption.");
      return { success: false, message };
    }
  },

  async getBilling(year: number): Promise<ServiceResult<MobileBillingData>> {
    try {
      const res = await MobileApi.getBilling(year);
      if (!res.success) {
        const message = res.error
          ? translate(ERROR_MESSAGE_KEYS[res.error] || "errors.loadBilling", "Unable to load billing.")
          : translate("errors.loadBilling", "Unable to load billing.");
        return { success: false, message, details: res.details };
      }

      const data = res.data as MobileBillingData | undefined;
      if (!data) {
        return { success: false, message: translate("errors.invalidBillingResponse", "Invalid billing response.") };
      }

      return { success: true, data };
    } catch (error: any) {
      const message = error?.response?.data?.error
        ? translate(
            ERROR_MESSAGE_KEYS[error.response.data.error] || "errors.loadBilling",
            "Unable to load billing."
          )
        : translate("errors.loadBilling", "Unable to load billing.");
      return { success: false, message };
    }
  },

  async getReadingContext(meterId?: string): Promise<ServiceResult<MobileReadingContext>> {
    try {
      const res = await MobileApi.getReadingContext(meterId);
      if (!res.success) {
        const message = res.error
          ? translate(ERROR_MESSAGE_KEYS[res.error] || "errors.loadReadingData", "Unable to load reading data.")
          : translate("errors.loadReadingData", "Unable to load reading data.");
        return { success: false, message, details: res.details };
      }

      const data = res.data as MobileReadingContext | undefined;
      if (!data) {
        return { success: false, message: translate("errors.invalidReadingResponse", "Invalid reading response.") };
      }

      return { success: true, data };
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { error?: string } } };
      const code = apiError.response?.data?.error;
      const message = code
        ? translate(ERROR_MESSAGE_KEYS[code] || "errors.loadReadingData", "Unable to load reading data.")
        : translate("errors.loadReadingData", "Unable to load reading data.");
      return { success: false, message };
    }
  },

  async createReading(input: MobileReadingCreateInput): Promise<ServiceResult<MobileReadingResult>> {
    try {
      const res = await MobileApi.createReading(input);
      if (!res.success) {
        const message = res.error
          ? translate(ERROR_MESSAGE_KEYS[res.error] || "errors.submitReading", "Unable to submit reading.")
          : translate("errors.submitReading", "Unable to submit reading.");
        return { success: false, message, details: res.details };
      }

      const data = res.data as MobileReadingResult | undefined;
      if (!data?.reading) {
        return { success: false, message: translate("errors.invalidReadingResponse", "Invalid reading response.") };
      }

      return { success: true, data };
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { error?: string } } };
      const code = apiError.response?.data?.error;
      const message = code
        ? translate(ERROR_MESSAGE_KEYS[code] || "errors.submitReading", "Unable to submit reading.")
        : translate("errors.submitReading", "Unable to submit reading.");
      return { success: false, message };
    }
  },

  async getPayment(): Promise<ServiceResult<MobilePaymentData>> {
    try {
      const res = await MobileApi.getPayment();
      if (!res.success) {
        const message = res.error
          ? translate(ERROR_MESSAGE_KEYS[res.error] || "errors.loadPayment", "Unable to load payment details.")
          : translate("errors.loadPayment", "Unable to load payment details.");
        return { success: false, message, details: res.details };
      }

      const data = res.data as MobilePaymentData | undefined;
      if (!data) {
        return { success: false, message: translate("errors.invalidPaymentResponse", "Invalid payment response.") };
      }

      return { success: true, data };
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { error?: string } } };
      const code = apiError.response?.data?.error;
      const message = code
        ? translate(ERROR_MESSAGE_KEYS[code] || "errors.loadPayment", "Unable to load payment details.")
        : translate("errors.loadPayment", "Unable to load payment details.");
      return { success: false, message };
    }
  },

  async payInvoice(invoiceId: string): Promise<ServiceResult<{ updated: number }>> {
    try {
      const res = await MobileApi.payInvoice(invoiceId);
      if (!res.success) {
        const message = res.error
          ? translate(ERROR_MESSAGE_KEYS[res.error] || "errors.submitPayment", "Unable to submit payment.")
          : translate("errors.submitPayment", "Unable to submit payment.");
        return { success: false, message, details: res.details };
      }

      const data = res.data as { updated: number } | undefined;
      if (!data) {
        return { success: false, message: translate("errors.invalidPaymentResponse", "Invalid payment response.") };
      }

      return { success: true, data };
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { error?: string } } };
      const code = apiError.response?.data?.error;
      const message = code
        ? translate(ERROR_MESSAGE_KEYS[code] || "errors.submitPayment", "Unable to submit payment.")
        : translate("errors.submitPayment", "Unable to submit payment.");
      return { success: false, message };
    }
  },

  async getNotifications(): Promise<ServiceResult<MobileNotificationsData>> {
    try {
      const res = await MobileApi.getNotifications();
      if (!res.success) {
        const message = res.error
          ? translate(ERROR_MESSAGE_KEYS[res.error] || "errors.loadNotifications", "Unable to load notifications.")
          : translate("errors.loadNotifications", "Unable to load notifications.");
        return { success: false, message, details: res.details };
      }

      const data = res.data as MobileNotificationsData | undefined;
      if (!data) {
        return {
          success: false,
          message: translate("errors.invalidNotificationsResponse", "Invalid notifications response."),
        };
      }

      return { success: true, data };
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { error?: string } } };
      const code = apiError.response?.data?.error;
      const message = code
        ? translate(ERROR_MESSAGE_KEYS[code] || "errors.loadNotifications", "Unable to load notifications.")
        : translate("errors.loadNotifications", "Unable to load notifications.");
      return { success: false, message };
    }
  },

  async getStaffMeters(): Promise<ServiceResult<MobileStaffMetersData>> {
    try {
      const res = await MobileApi.getStaffMeters();
      if (!res.success) {
        const message = res.error
          ? translate(ERROR_MESSAGE_KEYS[res.error] || "errors.loadStaffMeters", "Unable to load meters.")
          : translate("errors.loadStaffMeters", "Unable to load meters.");
        return { success: false, message, details: res.details };
      }

      const data = res.data as MobileStaffMetersData | undefined;
      if (!data) {
        return { success: false, message: translate("errors.invalidMetersResponse", "Invalid meters response.") };
      }

      return { success: true, data };
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { error?: string } } };
      const code = apiError.response?.data?.error;
      const message = code
        ? translate(ERROR_MESSAGE_KEYS[code] || "errors.loadStaffMeters", "Unable to load meters.")
        : translate("errors.loadStaffMeters", "Unable to load meters.");
      return { success: false, message };
    }
  },
};
