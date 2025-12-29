import { useMemo } from 'react';
// routes
import { paths } from 'src/routes/paths';
// locales
import { useLocales } from 'src/locales';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import SvgColor from 'src/components/svg-color';

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
          },
          {
            title: 'Meters',
            path: paths.dashboard.meters.root,
            icon: ICONS.meters,
          },
          {
            title: 'Billing',
            path: paths.dashboard.billing.root,
            icon: ICONS.billing,
          },
          {
            title: 'Tariffs',
            path: paths.dashboard.billing.tariffs.root,
            icon: ICONS.billing,
          },
          {
            title: 'Jobs',
            path: paths.dashboard.jobs.root,
            icon: ICONS.jobs,
            roles: ['admin'],
          },
          {
            title: 'Settings',
            path: paths.dashboard.settings.root,
            icon: ICONS.settings,
            roles: ['admin'],
          },
        ],
      },
    ],
    []
  );

  return data;
}
