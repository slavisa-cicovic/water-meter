import { TokenService } from './tokenService';
import {
  AccountRow,
  ConsumerRegistrationInput,
  StaffRegistrationInput,
  VerificationAction,
  VerificationResponse,
  VerificationStatus,
} from 'src/types/accounts';
import {
  validateConsumerRegistration,
  validateStaffRegistration,
  validateVerificationAction,
} from 'src/validation/accounts';
import { AccountRepository } from 'src/repositories/accountRepository';

const toAccountRole = (staffRole?: string) => (staffRole === 'backoffice' ? 'staff_backoffice' : 'staff_field');

const mapAccountToRow = (acct: any): AccountRow => ({
  id: acct.id,
  type: acct.role === 'consumer' ? 'consumer' : 'staff',
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
  },
  verificationLog: acct.verificationLogs?.map((log: any) => ({
    id: log.id,
    accountId: log.accountId,
    reviewerId: log.reviewerId,
    status: log.status as VerificationStatus,
    note: log.note || undefined,
    reviewedAt: log.reviewedAt.toISOString(),
  })),
});

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
    type?: 'consumer' | 'staff';
    status?: VerificationStatus;
    page?: number;
    pageSize?: number;
  } = {}): Promise<{ accounts: AccountRow[]; total: number }> {
    const { accounts, total } = await AccountRepository.list(params);
    return { accounts: accounts.map(mapAccountToRow), total };
  },

  async findById(id: string): Promise<AccountRow | null> {
    const acct = await AccountRepository.findById(id);

    return acct ? mapAccountToRow(acct) : null;
  },
};
