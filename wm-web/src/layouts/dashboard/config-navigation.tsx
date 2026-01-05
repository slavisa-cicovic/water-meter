import { useMemo } from 'react';
// routes
import { paths } from 'src/routes/paths';
// locales
import { useLocales } from 'src/locales';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import SvgColor from 'src/components/svg-color';
import { PERMISSIONS } from 'src/constants/permissions';

// ----------------------------------------------------------------------

const icon = (name: string) => (
  <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />
);

const ICONS = {
  accounts: icon('ic_user'),
  dashboard: icon('ic_dashboard'),
  meters: icon('ic_dashboard'),
  billing: icon('ic_dashboard'),
  jobs: icon('ic_dashboard'),
  settings: icon('ic_dashboard'),
};

// ----------------------------------------------------------------------

export function useNavData() {

  const data = useMemo(
    () => [
      {
        subheader: 'Overview',
        items: [
          {
            title: 'app',
            path: paths.dashboard.root,
            icon: ICONS.dashboard,
          },
          {
            title: 'Accounts',
            path: paths.dashboard.accounts.root,
            icon: ICONS.accounts,
            permissions: [PERMISSIONS.ACCOUNTS_LIST],
          },
          {
            title: 'Meters',
            path: paths.dashboard.meters.root,
            icon: ICONS.meters,
            permissions: [PERMISSIONS.METERS_LIST],
          },
          {
            title: 'Billing',
            path: paths.dashboard.billing.root,
            icon: ICONS.billing,
            permissions: [PERMISSIONS.BILLING_LIST],
          },
          {
            title: 'Tariffs',
            path: paths.dashboard.billing.tariffs.root,
            icon: ICONS.billing,
            permissions: [PERMISSIONS.TARIFFS_LIST],
          },
          {
            title: 'Jobs',
            path: paths.dashboard.jobs.root,
            icon: ICONS.jobs,
            permissions: [PERMISSIONS.JOBS_LIST],
          },
          {
            title: 'Settings',
            path: paths.dashboard.settings.root,
            icon: ICONS.settings,
            permissions: [PERMISSIONS.SETTINGS_READ],
          },
        ],
      },
    ],
    []
  );

  return data;
}
