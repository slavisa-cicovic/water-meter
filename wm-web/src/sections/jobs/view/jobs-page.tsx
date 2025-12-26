'use client';

import RoleBasedGuard from 'src/auth/guard/role-based-guard';
import { JobsListView } from './jobs-list-view';

export function JobsPage() {
  return (
    <RoleBasedGuard roles={['admin']} hasContent sx={{ my: 2 }}>
      <JobsListView />
    </RoleBasedGuard>
  );
}
