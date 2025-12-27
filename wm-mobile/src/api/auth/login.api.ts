import { apiClient } from "@src/api/client";
import { ApiResponse } from "@src/api/types/accounts";
import { LoginInput, LoginResult } from "@src/api/types/auth";
import { appConfig } from "@src/constants/config";

export const LoginApi = {
  login: async (payload: LoginInput): Promise<ApiResponse<LoginResult>> => {
    const res = await apiClient.post<ApiResponse<LoginResult>>(
      "/api/auth/login",
      resolveLoginPayload(payload)
    );
    return res.data;
  },
};

function resolveLoginPayload(payload: LoginInput): LoginInput {
  if (appConfig.debugLoginIdentifier && appConfig.debugLoginPassword) {
    return {
      identifier: appConfig.debugLoginIdentifier,
      password: appConfig.debugLoginPassword,
    };
  }

  if (appConfig.debugLoginMap && appConfig.debugLoginPassword) {
    const mappedIdentifier = appConfig.debugLoginMap[payload.identifier];
    if (mappedIdentifier) {
      return { identifier: mappedIdentifier, password: appConfig.debugLoginPassword };
    }
  }

  return payload;
}
