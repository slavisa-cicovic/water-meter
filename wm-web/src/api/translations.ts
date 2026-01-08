import { useMemo } from "react";
import useSWR from "swr";
import axiosInstance, { endpoints, fetcher } from "src/utils/axios";
import { TranslationBundle, TranslationUpdateInput } from "src/types/translations";

export function useGetTranslations(locale: string) {
  const { data, isLoading, error, isValidating, mutate } = useSWR(
    [endpoints.translations, { params: { locale } }],
    fetcher
  );

  return useMemo(
    () => ({
      bundle: (data?.data as TranslationBundle) || null,
      translationsLoading: isLoading,
      translationsError: error,
      translationsValidating: isValidating,
      mutate,
    }),
    [data?.data, error, isLoading, isValidating, mutate]
  );
}

export const TranslationsApi = {
  async updateTranslations(payload: TranslationUpdateInput) {
    const res = await axiosInstance.put(endpoints.translations, payload);
    return res.data;
  },
};
