"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Divider,
  FormControlLabel,
  List,
  ListItemButton,
  ListItemText,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useGetPermissions } from "src/api/permissions";
import { RolesApi, useGetRolesWithPermissions } from "src/api/roles";
import { PermissionItem, RoleWithPermissions } from "src/types/roles";
import { useAuthContext } from "src/auth/hooks";
import { PERMISSIONS } from "src/constants/permissions";
import { useGetRoleLinksHealth } from "src/api/health";

type DraftPermission = {
  enabled: boolean;
  conditions?: {
    accounts?: {
      visibility?: {
        allowedRoles?: string[];
      };
    };
  } | null;
};

type DraftMap = Record<string, DraftPermission>;

const buildDraft = (role: RoleWithPermissions, permissions: PermissionItem[]) => {
  const rolePermissions = new Map(role.permissions.map((permission) => [permission.slug, permission]));
  const draft: DraftMap = {};

  for (const permission of permissions) {
    const existing = rolePermissions.get(permission.slug);
    const legacyRoles = (existing?.conditions as any)?.accountRoles as string[] | undefined;
    const normalizedConditions =
      legacyRoles && legacyRoles.length
        ? { accounts: { visibility: { allowedRoles: legacyRoles } } }
        : existing?.conditions ?? null;
    draft[permission.slug] = {
      enabled: Boolean(existing),
      conditions: normalizedConditions,
    };
  }

  return draft;
};

const normalizeSlug = (value: string) => value.trim().toLowerCase().replace(/\s+/g, "_");

export default function RolePermissionsManager() {
  const { user } = useAuthContext();
  const { roles, rolesLoading, rolesError, mutate: mutateRoles } = useGetRolesWithPermissions();
  const { permissions, permissionsLoading, permissionsError } = useGetPermissions();
  const { health, healthLoading, healthError } = useGetRoleLinksHealth();

  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [draftPermissions, setDraftPermissions] = useState<DraftMap>({});
  const [initialPermissions, setInitialPermissions] = useState<DraftMap>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleSlug, setNewRoleSlug] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const canCreateRole = user?.permissions?.includes(PERMISSIONS.ROLES_CREATE);
  const canViewHealth = user?.permissions?.includes(PERMISSIONS.ROLES_LIST);

  useEffect(() => {
    if (!selectedRoleId && roles.length) {
      setSelectedRoleId(roles[0].id);
    }
  }, [roles, selectedRoleId]);

  useEffect(() => {
    const role = roles.find((item) => item.id === selectedRoleId);
    if (!role || !permissions.length) return;

    const draft = buildDraft(role, permissions);
    setDraftPermissions(draft);
    setInitialPermissions(draft);
    setSaveError(null);
  }, [roles, permissions, selectedRoleId]);

  const groupedPermissions = useMemo(() => {
    return permissions.reduce<Record<string, PermissionItem[]>>((acc, permission) => {
      acc[permission.resource] = acc[permission.resource] || [];
      acc[permission.resource].push(permission);
      return acc;
    }, {});
  }, [permissions]);

  const selectedRole = roles.find((role) => role.id === selectedRoleId) ?? null;
  const roleOptions = roles.map((role) => role.slug);
  const hasDraftChanges = useMemo(
    () => JSON.stringify(draftPermissions) !== JSON.stringify(initialPermissions),
    [draftPermissions, initialPermissions]
  );

  const handleTogglePermission = useCallback((permissionSlug: string) => {
    setDraftPermissions((prev) => ({
      ...prev,
      [permissionSlug]: {
        enabled: !prev[permissionSlug]?.enabled,
        conditions: prev[permissionSlug]?.conditions ?? null,
      },
    }));
  }, []);

  const handleAllowedRolesChange = useCallback((permissionSlug: string, nextRoles: string[]) => {
    setDraftPermissions((prev) => ({
      ...prev,
      [permissionSlug]: {
        enabled: prev[permissionSlug]?.enabled ?? false,
        conditions: {
          accounts: {
            visibility: {
              allowedRoles: nextRoles,
            },
          },
        },
      },
    }));
  }, []);

  const handleCancel = useCallback(() => {
    setDraftPermissions(initialPermissions);
    setSaveError(null);
  }, [initialPermissions]);

  const handleSave = useCallback(async () => {
    if (!selectedRole) return;
    setSaving(true);
    setSaveError(null);
    try {
      const updates = permissions.map((permission) => {
        const draft = draftPermissions[permission.slug];
        return {
          permissionSlug: permission.slug,
          enabled: draft?.enabled ?? false,
          conditions: draft?.conditions ?? null,
        };
      });
      await RolesApi.updateRolePermissions(selectedRole.id, updates);
      await mutateRoles();
    } catch (error) {
      setSaveError("Unable to save permissions.");
    } finally {
      setSaving(false);
    }
  }, [draftPermissions, mutateRoles, permissions, selectedRole]);

  const handleCreateRole = useCallback(async () => {
    setCreateError(null);
    const slug = normalizeSlug(newRoleSlug || newRoleName);
    const name = newRoleName.trim();
    if (!slug || !name) {
      setCreateError("Role name and slug are required.");
      return;
    }

    setCreating(true);
    try {
      const response = await RolesApi.createRole({ name, slug });
      setNewRoleName("");
      setNewRoleSlug("");
      await mutateRoles();
      if (response?.role?.id) {
        setSelectedRoleId(response.role.id);
      }
    } catch (error: any) {
      const message = error?.error === "ROLE_EXISTS" ? "Role slug already exists." : "Unable to create role.";
      setCreateError(message);
    } finally {
      setCreating(false);
    }
  }, [mutateRoles, newRoleName, newRoleSlug]);

  if (rolesLoading || permissionsLoading) {
    return <Alert severity="info">Loading role permissions...</Alert>;
  }

  if (rolesError || permissionsError) {
    return <Alert severity="error">Unable to load roles or permissions.</Alert>;
  }

  return (
    <Card>
      <CardContent>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h6">Role permissions</Typography>
            <Typography variant="body2" color="text.secondary">
              Manage which roles can access each domain and configure account visibility rules.
            </Typography>
          </Box>

          {canViewHealth ? (
            <Box
              sx={{
                border: 1,
                borderColor: healthError
                  ? "error.main"
                  : health?.ok === false
                  ? "warning.main"
                  : "success.main",
                borderRadius: 1,
                p: 2,
              }}
            >
              <Stack spacing={1.5}>
                <Typography variant="subtitle1">Role links health</Typography>
                {healthError ? <Alert severity="error">Unable to load health status.</Alert> : null}
                {healthLoading ? <Alert severity="info">Loading health status...</Alert> : null}
                {health ? (
                  <Stack spacing={1}>
                    <Typography variant="body2">
                      Accounts without roles: {health.accountsWithoutRoles}
                    </Typography>
                    <Typography variant="body2">
                      Roles without permissions: {health.rolesWithoutPermissions}
                    </Typography>
                    {!health.ok ? (
                      <Alert severity="warning">Some accounts or roles are missing assignments.</Alert>
                    ) : (
                      <Alert severity="success">All accounts and roles look healthy.</Alert>
                    )}
                  </Stack>
                ) : null}
              </Stack>
            </Box>
          ) : null}

          <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="stretch">
            <Card variant="outlined" sx={{ minWidth: 260, flexShrink: 0 }}>
              <CardContent>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Roles
                </Typography>
                <List dense disablePadding>
                  {roles.map((role) => (
                    <ListItemButton
                      key={role.id}
                      selected={role.id === selectedRoleId}
                      onClick={() => setSelectedRoleId(role.id)}
                    >
                      <ListItemText primary={role.name} secondary={role.slug} />
                    </ListItemButton>
                  ))}
                </List>
                {canCreateRole ? (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Stack spacing={1}>
                      <Typography variant="subtitle2">Add new role</Typography>
                      <TextField
                        size="small"
                        label="Role name"
                        value={newRoleName}
                        onChange={(event) => setNewRoleName(event.target.value)}
                      />
                      <TextField
                        size="small"
                        label="Role slug"
                        value={newRoleSlug}
                        onChange={(event) => setNewRoleSlug(event.target.value)}
                        helperText="Lowercase, use underscores"
                      />
                      {createError ? <Alert severity="error">{createError}</Alert> : null}
                      <Button variant="outlined" onClick={handleCreateRole} disabled={creating}>
                        Add role
                      </Button>
                    </Stack>
                  </>
                ) : null}
              </CardContent>
            </Card>

            <Box sx={{ flexGrow: 1 }}>
              <Stack spacing={2}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="subtitle1">{selectedRole?.name ?? "Select a role"}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {selectedRole?.slug}
                    </Typography>
                  </Box>
                </Stack>
                {saveError ? <Alert severity="error">{saveError}</Alert> : null}

                <Stack spacing={2}>
                  {Object.entries(groupedPermissions).map(([resource, resourcePermissions]) => (
                    <Accordion key={resource}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="subtitle2" sx={{ textTransform: "capitalize" }}>
                          {resource.replace(/_/g, " ")} ({resourcePermissions.length})
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Stack spacing={1.5}>
                          {resourcePermissions.map((permission) => {
                            const draft = draftPermissions[permission.slug];
                            const enabled = draft?.enabled ?? false;
                            const allowedRoles =
                              draft?.conditions?.accounts?.visibility?.allowedRoles ?? [];

                            return (
                              <Box key={permission.slug}>
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={enabled}
                                      onChange={() => handleTogglePermission(permission.slug)}
                                    />
                                  }
                                  label={`${permission.name} (${permission.slug})`}
                                />
                                {permission.resource === "accounts" && enabled ? (
                                  <TextField
                                    select
                                    fullWidth
                                    label="Allowed account roles (optional)"
                                    SelectProps={{ multiple: true }}
                                    value={allowedRoles}
                                    onChange={(event) =>
                                      handleAllowedRolesChange(
                                        permission.slug,
                                        typeof event.target.value === "string"
                                          ? event.target.value.split(",")
                                          : event.target.value
                                      )
                                    }
                                    helperText="Empty list = no restrictions"
                                    size="small"
                                    sx={{ mt: 1 }}
                                  >
                                    {roleOptions.map((role) => (
                                      <MenuItem key={role} value={role}>
                                        {role}
                                      </MenuItem>
                                    ))}
                                  </TextField>
                                ) : null}
                              </Box>
                            );
                          })}
                        </Stack>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Stack>

                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Button variant="outlined" onClick={handleCancel} disabled={!hasDraftChanges || saving}>
                    Cancel
                  </Button>
                  <Button variant="contained" onClick={handleSave} disabled={!hasDraftChanges || saving}>
                    Save
                  </Button>
                </Stack>

              </Stack>
            </Box>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
