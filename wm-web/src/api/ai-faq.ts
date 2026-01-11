import { useMemo } from "react";
import useSWR from "swr";
import axiosInstance, { endpoints, fetcher } from "src/utils/axios";
import { AiFaqCreateInput, AiFaqEntry, AiFaqUpdateInput } from "src/types/aiFaq";

type AiFaqListResponse = { entries: AiFaqEntry[] };

export const useGetAiFaqEntries = () => {
  const { data, isLoading, error, isValidating, mutate } = useSWR(endpoints.aiFaq.root, fetcher);

  return useMemo(
    () => ({
      entries: (data?.data as AiFaqListResponse | undefined)?.entries ?? [],
      entriesLoading: isLoading,
      entriesError: error,
      entriesValidating: isValidating,
      mutate,
    }),
    [data?.data, error, isLoading, isValidating, mutate]
  );
};

export const AiFaqApi = {
  async create(payload: AiFaqCreateInput) {
    const res = await axiosInstance.post(endpoints.aiFaq.root, payload);
    return res.data;
  },
  async update(payload: AiFaqUpdateInput) {
    const res = await axiosInstance.put(endpoints.aiFaq.entry(payload.id), payload);
    return res.data;
  },
};
