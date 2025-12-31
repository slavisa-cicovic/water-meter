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
import { AccountRole, Prisma } from '@prisma/client';

const toAccountRole = (staffRole?: string) => (staffRole === 'backoffice' ? 'staff_backoffice' : 'staff_field');

type AccountWithProfiles = Prisma.AccountGetPayload<{
  include: { consumerProfile: true; staffProfile: true; verificationLogs: true };
}> & {
  avatarUrl?: string | null;
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

  if (acct.role === 'consumer') {
    return {
      ...base,
      type: 'consumer',
    };
  }

  return {
    ...base,
    type: acct.role as Exclude<AccountRole, 'consumer'>,
    ...(acct.avatarUrl ? { avatar: acct.avatarUrl } : {}),
  };
};

export const AccountsService = {
  async registerConsumer(input: ConsumerRegistrationInput) {
    const validation = validateConsumerRegistration(input);
    if (!validation.valid) {
      return { success: false, error: 'VALIDATION_FAILED', details: validation.errors };
    }

    try {
      const account = await AccountRepository.createConsumer({
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        phone: input.phone,
        address: input.address,
        password: input.password, // TODO: hash password
        householdSize: input.householdSize,
      });

      return {
        success: true,
        data: {
          id: account.id,
          verificationStatus: account.verificationStatus as VerificationStatus,
          token: TokenService.issueAccountToken({
            id: account.id,
            role: 'consumer',
            verificationStatus: account.verificationStatus as VerificationStatus,
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
      const account = await AccountRepository.createStaff({
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        phone: input.phone,
        address: input.address,
        password: input.password, // TODO: hash password
        staffRole: input.staffRole,
        role: toAccountRole(input.staffRole),
      });

      return {
        success: true,
        data: {
          id: account.id,
          verificationStatus: account.verificationStatus as VerificationStatus,
          token: TokenService.issueAccountToken({
            id: account.id,
            role: account.role,
            verificationStatus: account.verificationStatus as VerificationStatus,
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

  async verify(action: VerificationAction): Promise<{ success: boolean; error?: string; details?: any; data?: VerificationResponse }> {
    const validation = validateVerificationAction(action);
    if (!validation.valid) {
      return { success: false, error: 'VALIDATION_FAILED', details: validation.errors };
    }

    try {
      const account = await AccountRepository.findById(action.accountId);

      if (!account) {
        return { success: false, error: 'NOT_FOUND' };
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
            role: updated.role,
            verificationStatus: updated.verificationStatus as VerificationStatus,
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
    type?: 'consumer' | 'staff' | 'admin' | 'staff_backoffice' | 'staff_field';
    status?: VerificationStatus;
    page?: number;
    pageSize?: number;
    viewerRole?: 'admin' | 'staff_backoffice';
  } = {}): Promise<{ accounts: AccountRow[]; total: number }> {
    const { viewerRole, ...rest } = params;
    let allowedRoles: AccountRole[] | undefined;

    if (viewerRole === 'staff_backoffice') {
      const base = [AccountRole.consumer, AccountRole.staff_field, AccountRole.staff_backoffice];
      if (rest.type === 'consumer') allowedRoles = [AccountRole.consumer];
      else if (rest.type === 'staff_field') allowedRoles = [AccountRole.staff_field];
      else if (rest.type === 'staff_backoffice') allowedRoles = [AccountRole.staff_backoffice];
      else allowedRoles = base;
    } else if (viewerRole === 'admin') {
      const base = [AccountRole.admin, AccountRole.staff_backoffice];
      if (rest.type === 'admin') allowedRoles = [AccountRole.admin];
      else if (rest.type === 'staff_backoffice') allowedRoles = [AccountRole.staff_backoffice];
      else allowedRoles = base;
    }

    const { accounts, total } = await AccountRepository.list({
      ...rest,
      allowedRoles,
    });
    return { accounts: accounts.map(mapAccountToRow), total };
  },

  async findById(id: string, viewerRole?: 'admin' | 'staff_backoffice'): Promise<AccountRow | null> {
    const acct = await AccountRepository.findById(id);

    if (!acct) return null;

    if (viewerRole === 'staff_backoffice' && !(acct.role === 'consumer' || acct.role === 'staff_field')) {
      return null;
    }

    if (viewerRole === 'admin' && (acct.role === 'consumer' || acct.role === 'staff_field')) {
      return null;
    }

    return mapAccountToRow(acct);
  },

  async updateAccount(
    id: string,
    input: AccountUpdateInput,
    options: { viewerRole?: 'admin' | 'staff_backoffice'; viewerId?: string } = {}
  ): Promise<{ success: boolean; error?: string; details?: any; data?: { account: AccountRow } }> {
    const validation = validateAccountUpdate(input);
    if (!validation.valid) return { success: false, error: 'VALIDATION_FAILED', details: validation.errors };

    const account = await AccountRepository.findById(id);
    if (!account) return { success: false, error: 'NOT_FOUND' };

    const viewerRole = options.viewerRole;
    if (viewerRole === 'staff_backoffice' && !(account.role === 'consumer' || account.role === 'staff_field')) {
      return { success: false, error: 'FORBIDDEN' };
    }
    if (viewerRole === 'admin' && (account.role === 'consumer' || account.role === 'staff_field')) {
      return { success: false, error: 'FORBIDDEN' };
    }

    const normalizedTariffId =
      typeof input.tariffId === 'string' ? (input.tariffId.trim() ? input.tariffId.trim() : null) : input.tariffId;

    if (normalizedTariffId !== undefined && account.role !== 'consumer') {
      return { success: false, error: 'INVALID_TARIFF_ASSIGNMENT' };
    }

    if (normalizedTariffId) {
      const tariff = await BillingRepository.findTariffById(normalizedTariffId);
      if (!tariff || tariff.deletedAt) {
        return { success: false, error: 'TARIFF_NOT_FOUND' };
      }
    }

    await AccountRepository.updateAccountDetails(id, {
      firstName: input.firstName,
      lastName: input.lastName,
      address: input.address,
    });

    if (account.role === 'consumer' && normalizedTariffId !== undefined) {
      await AccountRepository.updateConsumerProfile(id, { tariffId: normalizedTariffId ?? null });
    }

    if (account.role === 'consumer' && input.updateMeterAddress) {
      const meters = await MeterRepository.listByConsumer(id);
      await Promise.all(meters.map((meter) => MeterRepository.update({ id: meter.id, address: input.address })));
    }

    const updated = await AccountRepository.findById(id);
    if (!updated) return { success: false, error: 'NOT_FOUND' };

    return { success: true, data: { account: mapAccountToRow(updated) } };
  },
};
