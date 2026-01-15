import axios, { AxiosRequestConfig } from 'axios';
// config
import { HOST_API } from 'src/config-global';
import { getStoredAccessToken, setStoredAccessToken } from 'src/auth/context/jwt/token-storage';
import { setSession } from 'src/auth/context/jwt/utils';

// ----------------------------------------------------------------------

const axiosInstance = axios.create({ baseURL: HOST_API });

const refreshClient = axios.create({ baseURL: HOST_API });
let refreshPromise: Promise<{ accessToken?: string; user?: any } | null> | null = null;

axiosInstance.interceptors.response.use(
  (res) => res,
  async (error) => {
    const status = error?.response?.status;
    const data = error?.response?.data;
    const originalRequest = error?.config as (AxiosRequestConfig & { _retry?: boolean }) | undefined;

    if (status === 401 && data?.error === 'STALE_TOKEN' && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        if (!refreshPromise) {
          refreshPromise = refreshClient
            .post(endpoints.auth.refresh, null, {
              headers: { Authorization: axiosInstance.defaults.headers.common.Authorization },
            })
            .then((res) => res.data)
            .catch(() => null);
        }

        const refreshed = await refreshPromise;
        refreshPromise = null;

        const accessToken = refreshed?.data?.accessToken || refreshed?.accessToken;
        const user = refreshed?.data?.user || refreshed?.user;

        if (!accessToken) {
          setSession(null);
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('auth:logout'));
          }
          return Promise.reject(data || 'Something went wrong');
        }

        const stored = getStoredAccessToken();
        setStoredAccessToken(accessToken, stored.remember);
        setSession(accessToken);
        if (typeof window !== 'undefined' && user) {
          window.dispatchEvent(new CustomEvent('auth:refresh', { detail: { user } }));
        }

        originalRequest.headers = {
          ...(originalRequest.headers || {}),
          Authorization: `Bearer ${accessToken}`,
        };

        return axiosInstance(originalRequest);
      } catch {
        refreshPromise = null;
        return Promise.reject(data || 'Something went wrong');
      }
    }

    return Promise.reject((error.response && error.response.data) || 'Something went wrong');
  }
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
    refresh: '/api/auth/refresh',
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
    lineItems: '/api/billing/line-items',
    lineItemDetails: (id: string) => `/api/billing/line-items/${id}`,
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
  dashboard: {
    summary: '/api/dashboard',
  },
  messages: {
    root: '/api/messages',
  },
  aiFaq: {
    root: '/api/ai/faq',
    entry: (id: string) => `/api/ai/faq/${id}`,
  },
  settings: '/api/settings',
  translations: '/api/translations',
};
