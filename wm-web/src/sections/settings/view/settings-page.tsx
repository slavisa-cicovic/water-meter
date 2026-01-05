"use client";

import RoleBasedGuard from "src/auth/guard/role-based-guard";
import { PERMISSIONS } from "src/constants/permissions";
import { SettingsView } from "./settings-view";

export function SettingsPage() {
  return (
    <RoleBasedGuard permissions={[PERMISSIONS.SETTINGS_READ]} hasContent sx={{ my: 2 }}>
      <SettingsView />
    </RoleBasedGuard>
  );
}
