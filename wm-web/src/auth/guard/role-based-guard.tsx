'use client';

// @mui
import { Theme, SxProps } from '@mui/material/styles';
// hooks
import { useAuthContext } from '../hooks';
// components
import PermissionDenied from 'src/components/permission-denied';

// ----------------------------------------------------------------------

type RoleBasedGuardProp = {
  hasContent?: boolean;
  roles?: string[];
  permissions?: string[];
  children: React.ReactNode;
  sx?: SxProps<Theme>;
};

export default function RoleBasedGuard({ hasContent, roles, permissions, children, sx }: RoleBasedGuardProp) {
  const { user, loading } = useAuthContext();

  const currentRole = user?.role;
  const currentRoles = Array.isArray(user?.roles)
    ? (user?.roles as string[])
    : currentRole
    ? [currentRole]
    : [];
  const currentPermissions = user?.permissions as string[] | undefined;

  if (loading) {
    return null;
  }

  const hasRoleAccess =
    typeof roles === 'undefined' || roles.some((role) => currentRoles.includes(role));
  const hasPermissionAccess =
    typeof permissions === 'undefined' ||
    permissions.some((permission) => currentPermissions?.includes(permission));

  if (!hasRoleAccess || !hasPermissionAccess) {
    return hasContent ? (
      <PermissionDenied sx={sx} />
    ) : null;
  }

  return <> {children} </>;
}
