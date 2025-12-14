// utils

// ----------------------------------------------------------------------

const ROOTS = {
  AUTH: '/auth',
  DASHBOARD: '/dashboard',
};

// ----------------------------------------------------------------------

export const paths = {
  page403: '/error/403',
  page404: '/error/404',
  page500: '/error/500',
  // AUTH
  auth: {
      login: `${ROOTS.AUTH}/login`,
      register: `${ROOTS.AUTH}/register`,
  },
  // DASHBOARD
  dashboard: {
    root: ROOTS.DASHBOARD,
    accounts: {
      root: `${ROOTS.DASHBOARD}/accounts`,
      details: (id: string) => `${ROOTS.DASHBOARD}/accounts/${id}`,
    },
  },
};
