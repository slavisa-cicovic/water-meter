"use client";

import RoleBasedGuard from "src/auth/guard/role-based-guard";
import { SettingsView } from "./settings-view";

export function SettingsPage() {
  return (
    <RoleBasedGuard roles={["admin"]} hasContent sx={{ my: 2 }}>
      <SettingsView />
    </RoleBasedGuard>
  );
}
