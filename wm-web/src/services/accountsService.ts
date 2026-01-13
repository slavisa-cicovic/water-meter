import { TokenService } from './tokenService';
import {
  AccountRow,
  AccountUpdateInput,
  ConsumerRegistrationInput,
  StaffRegistrationInput,
  VerificationAction,
  VerificationResponse,
  VerificationStatus,
} from 'src/types/accounts';
import {
  validateConsumerRegistration,
  validateStaffRegistration,
  validateAccountUpdate,
  validateVerificationAction,
} from 'src/validation/accounts';
import { AccountRepository } from 'src/repositories/accountRepository';
import { BillingRepository } from 'src/repositories/billingRepository';
import { MeterRepository } from 'src/repositories/meterRepository';
import { Prisma, StaffRole } from '@prisma/client';
import prisma from 'src/utils/prisma';
import { AuthorizationService } from './authorizationService';
import { PERMISSIONS } from 'src/constants/permissions';
import { PasswordService } from './passwordService';

const toAccountRoleSlug = async (staffRole?: StaffRole) => {
  if (!staffRole) return 'staff_field';
  const role = await prisma.role.findFirst({
    where: { staffRole } as any,
    select: { slug: true },
  });

  if (role?.slug) return role.slug;

  return staffRole === 'backoffice' ? 'staff_backoffice' : 'staff_field';
};

type AccountWithProfiles = Prisma.AccountGetPayload<{
  include: {
    consumerProfile: true;
    staffProfile: true;
    verificationLogs: true;
    accountRoleLinks: { include: { role: { select: { slug: true } } } };
  };
}> & {
  avatarUrl?: string | null;
};

const getAccountRoleSlugs = (acct: AccountWithProfiles) => {
  if (acct.accountRoleLinks?.length) {
    return acct.accountRoleLinks
      .map((link) => link.role?.slug)
      .filter((slug): slug is string => Boolean(slug))
      .sort();
  }

  return [];
};

const mapAccountToRow = (acct: AccountWithProfiles): AccountRow => {
  const base = {
    id: acct.id,
    verificationStatus: acct.verificationStatus as VerificationStatus,
    createdAt: acct.createdAt?.toISOString?.() ?? acct.createdAt,
    updatedAt: acct.updatedAt?.toISOString?.() ?? acct.updatedAt,
    data: {
      firstName: acct.firstName,
      lastName: acct.lastName,
      email: acct.email,
      phone: acct.phone || undefined,
      address: acct.address,
      householdSize: acct.consumerProfile?.householdSize,
      staffRole: acct.staffProfile?.staffRole,
      tariffId: acct.consumerProfile?.tariffId ?? null,
    },
    verificationLog: acct.verificationLogs?.map((log) => ({
      id: log.id,
      accountId: log.accountId,
      reviewerId: log.reviewerId,
      status: log.status as VerificationStatus,
      note: log.note || undefined,
      reviewedAt: log.reviewedAt.toISOString(),
    })),
  };

  const roleSlugs = getAccountRoleSlugs(acct);
  const primaryRole = roleSlugs[0] ?? 'unknown';
  if (roleSlugs.includes('consumer')) {
    return {
      ...base,
      type: 'consumer',
    };
  }

  return {
    ...base,
    type: primaryRole,
    ...(acct.avatarUrl ? { avatar: acct.avatarUrl } : {}),
  };
};

const resolveRoleId = async (slug: string) => {
  const role = await prisma.role.findUnique({ where: { slug }, select: { id: true } });
  return role?.id ?? null;
};

export const AccountsService = {
  async registerConsumer(input: ConsumerRegistrationInput) {
    const validation = validateConsumerRegistration(input);
    if (!validation.valid) {
      return { success: false, error: 'VALIDATION_FAILED', details: validation.errors };
    }

    try {
      const roleId = await resolveRoleId('consumer');
      if (!roleId) {
        return { success: false, error: 'ROLE_NOT_FOUND' };
      }
      const passwordHash = await PasswordService.hashPassword(input.password);
      const account = await AccountRepository.createConsumer({
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        phone: input.phone,
        address: input.address,
        passwordHash,
        householdSize: input.householdSize,
        roleId,
      });

      return {
        success: true,
        data: {
          id: account.id,
          verificationStatus: account.verificationStatus as VerificationStatus,
          token: TokenService.issueAccountToken({
            id: account.id,
            role: 'consumer',
            roles: ['consumer'],
            verificationStatus: account.verificationStatus as VerificationStatus,
            permissionsVersion: account.permissionsVersion,
          }),
        },
      };
    } catch (error: any) {
      if (error.code === 'P2002') {
        return { success: false, error: 'ACCOUNT_EXISTS' };
      }
      return { success: false, error: 'SERVER_ERROR' };
    }
  },

  async registerStaff(input: StaffRegistrationInput) {
    const validation = validateStaffRegistration(input);
    if (!validation.valid) {
      return { success: false, error: 'VALIDATION_FAILED', details: validation.errors };
    }

    try {
      const roleSlug = await toAccountRoleSlug(input.staffRole);
      const roleId = await resolveRoleId(roleSlug);
      if (!roleId) {
        return { success: false, error: 'ROLE_NOT_FOUND' };
      }
      const passwordHash = await PasswordService.hashPassword(input.password);
      const account = await AccountRepository.createStaff({
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        phone: input.phone,
        address: input.address,
        passwordHash,
        staffRole: input.staffRole,
        roleId,
      });

      return {
        success: true,
        data: {
          id: account.id,
          verificationStatus: account.verificationStatus as VerificationStatus,
          token: TokenService.issueAccountToken({
            id: account.id,
            role: roleSlug,
            roles: [roleSlug],
            verificationStatus: account.verificationStatus as VerificationStatus,
            permissionsVersion: account.permissionsVersion,
          }),
        },
      };
    } catch (error: any) {
      if (error.code === 'P2002') {
        return { success: false, error: 'ACCOUNT_EXISTS' };
      }
      return { success: false, error: 'SERVER_ERROR' };
    }
  },

  async verify(
    action: VerificationAction,
    options: { viewerAccountId?: string; permissionSlug?: string } = {}
  ): Promise<{ success: boolean; error?: string; details?: any; data?: VerificationResponse }> {
    const validation = validateVerificationAction(action);
    if (!validation.valid) {
      return { success: false, error: 'VALIDATION_FAILED', details: validation.errors };
    }

    try {
      const account = await AccountRepository.findById(action.accountId);

      if (!account) {
        return { success: false, error: 'NOT_FOUND' };
      }

      if (options.viewerAccountId) {
        const allowedRoles = await AuthorizationService.resolveAllowedAccountRoles(
          options.viewerAccountId,
          options.permissionSlug ?? PERMISSIONS.ACCOUNTS_VERIFY
        );
        const accountRoles = getAccountRoleSlugs(account);
        if (allowedRoles && !allowedRoles.some((role) => accountRoles.includes(role))) {
          return { success: false, error: 'FORBIDDEN' };
        }
      }

      if (account.verificationStatus !== 'pending' && account.verificationStatus === action.status) {
        return { success: false, error: 'NO_STATUS_CHANGE' };
      }

      if (account.verificationStatus !== 'pending' && action.status === 'pending') {
        return { success: false, error: 'INVALID_TRANSITION' };
      }

      if (!action.reviewerId) {
        return { success: false, error: 'MISSING_REVIEWER' };
      }

      const updated = await AccountRepository.updateVerification(
        action.accountId,
        action.status,
        action.reviewerId,
        action.note,
        action.reviewedAt
      );

      const auditEntry = updated.verificationLogs[0];
      const roles = await AuthorizationService.getRoleSlugsForAccount(updated.id);
      const primaryRole = roles[0] ?? 'unknown';

      return {
        success: true,
        data: {
          id: updated.id,
          verificationStatus: updated.verificationStatus as VerificationStatus,
          auditEntry: {
            id: auditEntry.id,
            accountId: auditEntry.accountId,
            reviewerId: auditEntry.reviewerId,
            status: auditEntry.status as VerificationStatus,
            note: auditEntry.note || undefined,
            reviewedAt: auditEntry.reviewedAt.toISOString(),
          },
          token: TokenService.issueAccountToken({
            id: updated.id,
            role: primaryRole,
            roles,
            verificationStatus: updated.verificationStatus as VerificationStatus,
            permissionsVersion: updated.permissionsVersion,
          }),
        },
      };
    } catch (error: any) {
      return { success: false, error: 'SERVER_ERROR' };
    }
  },

  async list(params: {
    search?: string;
    orderBy?: 'createdAt' | 'verificationStatus' | 'email' | 'name' | 'type';
    order?: 'asc' | 'desc';
    type?: string;
    status?: VerificationStatus;
    page?: number;
    pageSize?: number;
    viewerAccountId?: string;
  } = {}): Promise<{ accounts: AccountRow[]; total: number }> {
    const { viewerAccountId, ...rest } = params;

    const typeRoles: string[] | null = rest.type
      ? rest.type === 'consumer'
        ? ['consumer']
        : rest.type === 'staff'
        ? ['staff_field', 'staff_backoffice']
        : rest.type === 'admin'
        ? ['admin']
        : rest.type === 'staff_backoffice'
        ? ['staff_backoffice']
        : rest.type === 'staff_field'
        ? ['staff_field']
        : [rest.type]
      : null;

    const permissionRoles = viewerAccountId
      ? await AuthorizationService.resolveAllowedAccountRoles(viewerAccountId, PERMISSIONS.ACCOUNTS_LIST)
      : null;

    const allowedRoles = permissionRoles
      ? typeRoles
        ? permissionRoles.filter((role) => typeRoles.includes(role))
        : permissionRoles
      : typeRoles ?? undefined;

    if (allowedRoles && allowedRoles.length === 0) {
      return { accounts: [], total: 0 };
    }

    const { accounts, total } = await AccountRepository.list({
      ...rest,
      type: undefined,
      allowedRoles,
    });
    return { accounts: accounts.map(mapAccountToRow), total };
  },

  async findById(id: string, viewerAccountId?: string): Promise<AccountRow | null> {
    const acct = await AccountRepository.findById(id);

    if (!acct) return null;

    if (viewerAccountId) {
      const allowedRoles = await AuthorizationService.resolveAllowedAccountRoles(
        viewerAccountId,
        PERMISSIONS.ACCOUNTS_READ
      );
      const accountRoles = getAccountRoleSlugs(acct);
      if (allowedRoles && !allowedRoles.some((role) => accountRoles.includes(role))) {
        return null;
      }
    }

    return mapAccountToRow(acct);
  },

  async findByIdForViewer(
    id: string,
    viewerAccountId?: string
  ): Promise<{ account: AccountRow | null; error?: 'NOT_FOUND' | 'FORBIDDEN' }> {
    const acct = await AccountRepository.findById(id);

    if (!acct) {
      return { account: null, error: 'NOT_FOUND' };
    }

    if (viewerAccountId) {
      const allowedRoles = await AuthorizationService.resolveAllowedAccountRoles(
        viewerAccountId,
        PERMISSIONS.ACCOUNTS_READ
      );
      const accountRoles = getAccountRoleSlugs(acct);
      if (allowedRoles && !allowedRoles.some((role) => accountRoles.includes(role))) {
        return { account: null, error: 'FORBIDDEN' };
      }
    }

    return { account: mapAccountToRow(acct) };
  },

  async updateAccount(
    id: string,
    input: AccountUpdateInput,
    options: { viewerAccountId?: string; viewerId?: string } = {}
  ): Promise<{ success: boolean; error?: string; details?: any; data?: { account: AccountRow } }> {
    const validation = validateAccountUpdate(input);
    if (!validation.valid) return { success: false, error: 'VALIDATION_FAILED', details: validation.errors };

    const account = await AccountRepository.findById(id);
    if (!account) return { success: false, error: 'NOT_FOUND' };

    if (options.viewerAccountId) {
      const allowedRoles = await AuthorizationService.resolveAllowedAccountRoles(
        options.viewerAccountId,
        PERMISSIONS.ACCOUNTS_UPDATE
      );
      const accountRoles = getAccountRoleSlugs(account);
      if (allowedRoles && !allowedRoles.some((role) => accountRoles.includes(role))) {
        return { success: false, error: 'FORBIDDEN' };
      }
    } else if (options.viewerId) {
      return { success: false, error: 'FORBIDDEN' };
    }

    const normalizedTariffId =
      typeof input.tariffId === 'string' ? (input.tariffId.trim() ? input.tariffId.trim() : null) : input.tariffId;
    const normalizedRoleSlug =
      typeof input.roleSlug === 'string' ? input.roleSlug.trim() : input.roleSlug;

    const accountRoles = getAccountRoleSlugs(account);
    if (normalizedTariffId !== undefined && !accountRoles.includes('consumer')) {
      return { success: false, error: 'INVALID_TARIFF_ASSIGNMENT' };
    }

    if (normalizedTariffId) {
      const tariff = await BillingRepository.findTariffById(normalizedTariffId);
      if (!tariff || tariff.deletedAt) {
        return { success: false, error: 'TARIFF_NOT_FOUND' };
      }
    }

    if (normalizedRoleSlug) {
      if (!options.viewerAccountId) {
        return { success: false, error: 'FORBIDDEN' };
      }

      const viewerPermissions = await AuthorizationService.resolveAccountPermissions(options.viewerAccountId);
      if (!viewerPermissions.includes(PERMISSIONS.ACCOUNTS_ASSIGN_ROLE)) {
        return { success: false, error: 'FORBIDDEN' };
      }

      const allowedRoles = await AuthorizationService.resolveAllowedAccountRoles(
        options.viewerAccountId,
        PERMISSIONS.ACCOUNTS_ASSIGN_ROLE
      );
      if (allowedRoles && !allowedRoles.includes(normalizedRoleSlug)) {
        return { success: false, error: 'FORBIDDEN' };
      }

      if (!accountRoles.includes(normalizedRoleSlug)) {
        const role = await prisma.role.findUnique({
          where: { slug: normalizedRoleSlug },
          select: { id: true, slug: true, staffRole: true },
        });
        if (!role) {
          return { success: false, error: 'ROLE_NOT_FOUND' };
        }

        if (role.slug === 'consumer' && !account.consumerProfile) {
          await AccountRepository.updateConsumerProfile(id, { householdSize: 1 });
        }

        if (role.staffRole && !account.staffProfile) {
          await AccountRepository.updateStaffProfile(id, { staffRole: role.staffRole as StaffRole });
        }

        await AccountRepository.replaceAccountRole(id, role.id);
      }
    }

    await AccountRepository.updateAccountDetails(id, {
      firstName: input.firstName,
      lastName: input.lastName,
      address: input.address,
    });

    if (accountRoles.includes('consumer') && normalizedTariffId !== undefined) {
      await AccountRepository.updateConsumerProfile(id, { tariffId: normalizedTariffId ?? null });
    }

    if (accountRoles.includes('consumer') && input.updateMeterAddress) {
      const meters = await MeterRepository.listByConsumer(id);
      await Promise.all(meters.map((meter) => MeterRepository.update({ id: meter.id, address: input.address })));
    }

    const updated = await AccountRepository.findById(id);
    if (!updated) return { success: false, error: 'NOT_FOUND' };

    return { success: true, data: { account: mapAccountToRow(updated) } };
  },
};
