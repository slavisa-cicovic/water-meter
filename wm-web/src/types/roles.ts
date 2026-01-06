export type PermissionItem = {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  resource: string;
  action: string;
};

export type RolePermissionEntry = {
  slug: string;
  name?: string;
  resource?: string;
  action?: string;
  conditions?: {
    accounts?: {
      visibility?: {
        allowedRoles?: string[];
      };
    };
  } | null;
};

export type RoleWithPermissions = {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  isSystem: boolean;
  permissions: RolePermissionEntry[];
};
