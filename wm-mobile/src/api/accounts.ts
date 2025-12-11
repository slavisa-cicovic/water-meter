import { apiClient } from "@src/api/client";
import {
  ApiResponse,
  ConsumerRegistrationInput,
  RegistrationResult,
  StaffRegistrationInput,
} from "@src/api/types/accounts";

export const AccountsApi = {
  registerConsumer: async (
    payload: ConsumerRegistrationInput
  ): Promise<ApiResponse<RegistrationResult>> => {
    const res = await apiClient.post<ApiResponse<RegistrationResult>>(
      "/api/accounts/consumer",
      payload
    );
    return res.data;
  },

  registerStaff: async (
    payload: StaffRegistrationInput
  ): Promise<ApiResponse<RegistrationResult>> => {
    const res = await apiClient.post<ApiResponse<RegistrationResult>>(
      "/api/accounts/staff",
      payload
    );
    return res.data;
  },
};
