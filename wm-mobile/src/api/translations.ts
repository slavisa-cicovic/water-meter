import { apiClient } from "@src/api/client";

export type TranslationsResponse = {
  success: boolean;
  data?: {
    locale: string;
    updatedAt: string | null;
    translations: Record<string, string>;
  };
};

export const TranslationsApi = {
  async getTranslations(locale: string, headers?: Record<string, string>) {
    return apiClient.get<TranslationsResponse>("/api/translations", {
      params: { locale, target: "mobile" },
      headers,
      validateStatus: (status) => status === 200 || status === 304,
    });
  },
};
