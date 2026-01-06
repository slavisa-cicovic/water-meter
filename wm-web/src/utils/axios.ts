import axios, { AxiosRequestConfig } from 'axios';
// config
import { HOST_API } from 'src/config-global';

// ----------------------------------------------------------------------

const axiosInstance = axios.create({ baseURL: HOST_API });

axiosInstance.interceptors.response.use(
  (res) => res,
  (error) => Promise.reject((error.response && error.response.data) || 'Something went wrong')
);

export default axiosInstance;

// ----------------------------------------------------------------------

export const fetcher = async (args: string | [string, AxiosRequestConfig]) => {
  const [url, config] = Array.isArray(args) ? args : [args];

  const res = await axiosInstance.get(url, { ...config });

  return res.data;
};

// ----------------------------------------------------------------------

export const endpoints = {
  auth: {
    me: '/api/auth/me',
    login: '/api/auth/login',
    register: '/api/auth/register',
    forgotPassword: '/api/auth/forgot-password',
  },
  accounts: {
    list: '/api/accounts',
    details: (id: string) => `/api/accounts/${id}`,
    registerConsumer: '/api/accounts/consumer',
    registerStaff: '/api/accounts/staff',
    verify: '/api/accounts/verify',
  },
  meters: {
    list: '/api/meters',
    details: (id: string) => `/api/meters/${id}`,
    consumers: (id: string) => `/api/meters/${id}/consumers`,
  },
  readings: {
    list: '/api/readings',
    details: (id: string) => `/api/readings/${id}`,
  },
  billing: {
    list: '/api/billing',
    details: (id: string) => `/api/billing/${id}`,
    tariffs: '/api/billing/tariffs',
    tariffDetails: (id: string) => `/api/billing/tariffs/${id}`,
  },
  jobs: {
    list: '/api/jobs',
    details: (id: string) => `/api/jobs/${id}`,
    run: (id: string) => `/api/jobs/${id}/run`,
    runs: (id: string) => `/api/jobs/${id}/runs`,
  },
  roles: {
    list: '/api/roles',
    permissions: (id: string) => `/api/roles/${id}/permissions`,
  },
  health: {
    roleLinks: '/api/health/role-links',
  },
  permissions: {
    list: '/api/permissions',
  },
  notifications: {
    summary: '/api/notifications',
  },
  settings: '/api/settings',
};
