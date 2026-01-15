import { useMemo } from 'react';
// routes
import { paths } from 'src/routes/paths';
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
  meters: icon('ic_meters'),
  billing: icon('ic_billing'),
  tariffs: icon('ic_tariffs'),
  messages: icon('ic_messages'),
  jobs: icon('ic_jobs'),
  settings: icon('ic_settings'),
};

// ----------------------------------------------------------------------

export function useNavData() {

  const data = useMemo(
    () => [
      {
        subheader: 'Overview',
        subheaderKey: 'sidebar.overview',
        items: [
          {
            title: 'app',
            titleKey: 'sidebar.app',
            path: paths.dashboard.root,
            icon: ICONS.dashboard,
          },
          {
            title: 'Accounts',
            titleKey: 'sidebar.accounts',
            path: paths.dashboard.accounts.root,
            icon: ICONS.accounts,
            permissions: [PERMISSIONS.ACCOUNTS_LIST],
          },
          {
            title: 'Meters',
            titleKey: 'sidebar.meters',
            path: paths.dashboard.meters.root,
            icon: ICONS.meters,
            permissions: [PERMISSIONS.METERS_LIST],
          },
          {
            title: 'Billing',
            titleKey: 'sidebar.billing',
            path: paths.dashboard.billing.root,
            icon: ICONS.billing,
            permissions: [PERMISSIONS.BILLING_LIST],
            children: [
              {
                title: 'Billing Overview',
                titleKey: 'billing.overview.title',
                path: paths.dashboard.billing.root,
                icon: ICONS.billing,
                permissions: [PERMISSIONS.BILLING_LIST],
              },
              {
                title: 'Tariffs',
                titleKey: 'sidebar.tariffs',
                path: paths.dashboard.billing.tariffs.root,
                icon: ICONS.tariffs,
                permissions: [PERMISSIONS.TARIFFS_LIST],
              },
              {
                title: 'Invoice Line Items',
                titleKey: 'sidebar.invoiceLineItems',
                path: paths.dashboard.billing.lineItems.root,
                icon: ICONS.billing,
                permissions: [PERMISSIONS.INVOICE_LINE_ITEMS_LIST],
              },
            ],
          },
          {
            title: 'Messages',
            titleKey: 'sidebar.messages',
            path: paths.dashboard.messages.root,
            icon: ICONS.messages,
            permissions: [PERMISSIONS.MESSAGES_READ],
          },
          {
            title: 'Jobs',
            titleKey: 'sidebar.jobs',
            path: paths.dashboard.jobs.root,
            icon: ICONS.jobs,
            permissions: [PERMISSIONS.JOBS_LIST],
          },
          {
            title: 'Settings',
            titleKey: 'sidebar.settings',
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
