'use client';

import RoleBasedGuard from 'src/auth/guard/role-based-guard';
import { PERMISSIONS } from 'src/constants/permissions';
import { JobsListView } from './jobs-list-view';

export function JobsPage() {
  return (
    <RoleBasedGuard permissions={[PERMISSIONS.JOBS_LIST]} hasContent sx={{ my: 2 }}>
      <JobsListView />
    </RoleBasedGuard>
  );
}
