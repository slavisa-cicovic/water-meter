import { apiClient } from "@src/api/client";
import { ApiResponse, RegistrationInput, RegistrationResult } from "@src/api/types/accounts";

export const AccountsApi = {
  register: async (payload: RegistrationInput): Promise<ApiResponse<RegistrationResult>> => {
    const res = await apiClient.post<ApiResponse<RegistrationResult>>(
      "/api/accounts/consumer",
      payload
    );
    return res.data;
  },
  
};
