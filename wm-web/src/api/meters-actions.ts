import axiosInstance, { endpoints } from 'src/utils/axios';

export const MetersApi = {
  async create(payload: {
    serialNumber: string;
    groupCode?: string;
    address: string;
    type: 'automatic' | 'mechanical';
    status: 'inactive';
  }) {
    const res = await axiosInstance.post(endpoints.meters.list, payload);
    return { meterId: res.data?.meter?.id || res.data?.id };
  },

  async addConsumer(meterId: string, accountId: string) {
    await axiosInstance.post(endpoints.meters.consumers(meterId), { accountId });
  },
};

