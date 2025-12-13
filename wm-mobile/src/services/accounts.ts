import { AccountsApi } from "@src/api/accounts";
import {
  ConsumerRegistrationInput,
  RegistrationResult,
  StaffRegistrationInput,
} from "@src/api/types/accounts";

type ServiceResult<T> =
  | { success: true; data: T }
  | { success: false; message: string; details?: Record<string, string[]> };

const DUPLICATE_CODES = ["ACCOUNT_EXISTS"];

export const AccountsService = {
  async registerConsumer(input: ConsumerRegistrationInput): Promise<ServiceResult<RegistrationResult>> {
    try {
      const res = await AccountsApi.registerConsumer(input);
      if (!res.success) {
        if (res.error && DUPLICATE_CODES.includes(res.error)) {
          return { success: false, message: "Account already exists. Please confirm and sign in." };
        }
        return { success: false, message: "Registration failed.", details: res.details };
      }
      return { success: true, data: res.data as RegistrationResult };
    } catch (error: any) {
      const message = error?.response?.data?.error === "ACCOUNT_EXISTS"
        ? "Account already exists. Please confirm and sign in."
        : "Unable to register. Please try again.";
      return { success: false, message };
    }
  },

  async registerStaff(input: StaffRegistrationInput): Promise<ServiceResult<RegistrationResult>> {
    try {
      const res = await AccountsApi.registerStaff(input);
      if (!res.success) {
        if (res.error && DUPLICATE_CODES.includes(res.error)) {
          return { success: false, message: "Account already exists. Please confirm and sign in." };
        }
        return { success: false, message: "Registration failed.", details: res.details };
      }
      return { success: true, data: res.data as RegistrationResult };
    } catch (error: any) {
      const message = error?.response?.data?.error === "ACCOUNT_EXISTS"
        ? "Account already exists. Please confirm and sign in."
        : "Unable to register. Please try again.";
      return { success: false, message };
    }
  },
};
