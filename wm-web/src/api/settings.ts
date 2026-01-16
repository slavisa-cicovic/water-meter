import { useMemo } from "react";
import useSWR from "swr";
import axiosInstance, { endpoints, fetcher } from "src/utils/axios";
import { SettingsData, SettingsUpdateInput } from "src/types/settings";

export function useGetSettings() {
  const { data, isLoading, error, isValidating, mutate } = useSWR(endpoints.settings, fetcher);

  return useMemo(
    () => ({
      settings: (data?.data as SettingsData) || null,
      settingsLoading: isLoading,
      settingsError: error,
      settingsValidating: isValidating,
      mutate,
    }),
    [data?.data, error, isLoading, isValidating, mutate]
  );
}

export const SettingsApi = {
  async updateSetting(payload: SettingsUpdateInput) {
    const res = await axiosInstance.put(endpoints.settings, payload);
    return res.data;
  },
  async uploadCompanyLogo(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    const res = await axiosInstance.post(endpoints.settingsLogo, formData);
    return res.data;
  },
};
