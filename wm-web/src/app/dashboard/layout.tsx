"use client";

import DashboardLayout from "src/layouts/dashboard/layout";
import AuthGuard from "src/auth/guard/auth-guard";
import RoleBasedGuard from "src/auth/guard/role-based-guard";
import { PERMISSIONS } from "src/constants/permissions";

type Props = {
  children: React.ReactNode;
};

export default function Layout({ children }: Props) {
  return (
    <AuthGuard>
      <RoleBasedGuard
        permissions={[
          PERMISSIONS.ACCOUNTS_LIST,
          PERMISSIONS.METERS_LIST,
          PERMISSIONS.BILLING_LIST,
          PERMISSIONS.JOBS_LIST,
          PERMISSIONS.SETTINGS_READ,
        ]}
        hasContent
        sx={{ my: '2%' }}
      >
        <DashboardLayout>{children}</DashboardLayout>
      </RoleBasedGuard>
    </AuthGuard>
  );
}
