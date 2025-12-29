import { MobileApi } from "@src/api/mobile";
import {
  MobileAccountData,
  MobileBillingData,
  MobileConsumptionData,
  MobileProfileUpdateInput,
  MobileReadingContext,
  MobileReadingCreateInput,
  MobileReadingResult,
} from "@src/api/types/mobile";
import { useAuthStore } from "@src/state/auth-store";

type ServiceResult<T> =
  | { success: true; data: T }
  | { success: false; message: string; details?: Record<string, string[]> };

const ERROR_MESSAGES: Record<string, string> = {
  UNAUTHORIZED: "Please log in again.",
  INVALID_TOKEN: "Please log in again.",
  VALIDATION_FAILED: "Please check your details.",
  ACCOUNT_EXISTS: "Email is already in use.",
  NOT_FOUND: "Account not found.",
  READER_FORBIDDEN: "You are not allowed to submit readings.",
  ACCOUNT_MISMATCH: "Please log in again.",
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
  });
};

export const MobileService = {
  async getAccount(): Promise<ServiceResult<MobileAccountData>> {
    try {
      const res = await MobileApi.getAccount();
      if (!res.success) {
        const message = (res.error && ERROR_MESSAGES[res.error]) || "Unable to load account.";
        return { success: false, message, details: res.details };
      }

      const data = res.data as MobileAccountData | undefined;
      if (!data) {
        return { success: false, message: "Invalid account response." };
      }

      updateAuthUser(data);
      return { success: true, data };
    } catch (error: any) {
      const message = error?.response?.data?.error
        ? ERROR_MESSAGES[error.response.data.error] || "Unable to load account."
        : "Unable to load account.";
      return { success: false, message };
    }
  },

  async updateProfile(input: MobileProfileUpdateInput): Promise<ServiceResult<MobileAccountData>> {
    try {
      const res = await MobileApi.updateProfile(input);
      if (!res.success) {
        const message = (res.error && ERROR_MESSAGES[res.error]) || "Unable to update profile.";
        return { success: false, message, details: res.details };
      }

      const data = res.data as MobileAccountData | undefined;
      if (!data) {
        return { success: false, message: "Invalid profile response." };
      }

      updateAuthUser(data);
      return { success: true, data };
    } catch (error: any) {
      const message = error?.response?.data?.error
        ? ERROR_MESSAGES[error.response.data.error] || "Unable to update profile."
        : "Unable to update profile.";
      return { success: false, message };
    }
  },

  async getConsumption(year: number): Promise<ServiceResult<MobileConsumptionData>> {
    try {
      const res = await MobileApi.getConsumption(year);
      if (!res.success) {
        const message = (res.error && ERROR_MESSAGES[res.error]) || "Unable to load consumption.";
        return { success: false, message, details: res.details };
      }

      const data = res.data as MobileConsumptionData | undefined;
      if (!data) {
        return { success: false, message: "Invalid consumption response." };
      }

      return { success: true, data };
    } catch (error: any) {
      const message = error?.response?.data?.error
        ? ERROR_MESSAGES[error.response.data.error] || "Unable to load consumption."
        : "Unable to load consumption.";
      return { success: false, message };
    }
  },

  async getBilling(year: number): Promise<ServiceResult<MobileBillingData>> {
    try {
      const res = await MobileApi.getBilling(year);
      if (!res.success) {
        const message = (res.error && ERROR_MESSAGES[res.error]) || "Unable to load billing.";
        return { success: false, message, details: res.details };
      }

      const data = res.data as MobileBillingData | undefined;
      if (!data) {
        return { success: false, message: "Invalid billing response." };
      }

      return { success: true, data };
    } catch (error: any) {
      const message = error?.response?.data?.error
        ? ERROR_MESSAGES[error.response.data.error] || "Unable to load billing."
        : "Unable to load billing.";
      return { success: false, message };
    }
  },

  async getReadingContext(): Promise<ServiceResult<MobileReadingContext>> {
    try {
      const res = await MobileApi.getReadingContext();
      if (!res.success) {
        const message = (res.error && ERROR_MESSAGES[res.error]) || "Unable to load reading data.";
        return { success: false, message, details: res.details };
      }

      const data = res.data as MobileReadingContext | undefined;
      if (!data) {
        return { success: false, message: "Invalid reading response." };
      }

      return { success: true, data };
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { error?: string } } };
      const code = apiError.response?.data?.error;
      const message = code ? ERROR_MESSAGES[code] || "Unable to load reading data." : "Unable to load reading data.";
      return { success: false, message };
    }
  },

  async createReading(input: MobileReadingCreateInput): Promise<ServiceResult<MobileReadingResult>> {
    try {
      const res = await MobileApi.createReading(input);
      if (!res.success) {
        const message = (res.error && ERROR_MESSAGES[res.error]) || "Unable to submit reading.";
        return { success: false, message, details: res.details };
      }

      const data = res.data as MobileReadingResult | undefined;
      if (!data?.reading) {
        return { success: false, message: "Invalid reading response." };
      }

      return { success: true, data };
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { error?: string } } };
      const code = apiError.response?.data?.error;
      const message = code ? ERROR_MESSAGES[code] || "Unable to submit reading." : "Unable to submit reading.";
      return { success: false, message };
    }
  },
};
