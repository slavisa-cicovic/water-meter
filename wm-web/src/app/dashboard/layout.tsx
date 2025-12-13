"use client";

import DashboardLayout from "src/layouts/dashboard/layout";
import AuthGuard from "src/auth/guard/auth-guard";
import RoleBasedGuard from "src/auth/guard/role-based-guard";

type Props = {
  children: React.ReactNode;
};

export default function Layout({ children }: Props) {
  return (
    <AuthGuard>
      <RoleBasedGuard roles={["admin", "staff_backoffice"]}>
        <DashboardLayout>{children}</DashboardLayout>
      </RoleBasedGuard>
    </AuthGuard>
  );
}
