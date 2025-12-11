import prisma from 'src/utils/prisma';
import { TokenService } from './tokenService';
import {
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

const toAccountRole = (staffRole?: string) => (staffRole === 'backoffice' ? 'staff_backoffice' : 'staff_field');

export const AccountsService = {
  async registerConsumer(input: ConsumerRegistrationInput) {
    const validation = validateConsumerRegistration(input);
    if (!validation.valid) {
      return { success: false, error: 'VALIDATION_FAILED', details: validation.errors };
    }

    try {
      const account = await prisma.account.create({
        data: {
          firstName: input.firstName,
          lastName: input.lastName,
          email: input.email,
          phone: input.phone,
          address: input.address,
          passwordHash: input.password, // TODO: hash password
          role: 'consumer',
          consumerProfile: {
            create: {
              householdSize: input.householdSize,
            },
          },
        },
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
      const account = await prisma.account.create({
        data: {
          firstName: input.firstName,
          lastName: input.lastName,
          email: input.email,
          phone: input.phone,
          address: input.address,
          passwordHash: input.password, // TODO: hash password
          role: toAccountRole(input.staffRole),
          staffProfile: {
            create: {
              staffRole: input.staffRole,
            },
          },
        },
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
      const account = await prisma.account.findUnique({
        where: { id: action.accountId },
        include: { verificationLogs: true },
      });

      if (!account) {
        return { success: false, error: 'NOT_FOUND' };
      }

      if (account.verificationStatus !== 'pending' && account.verificationStatus === action.status) {
        return { success: false, error: 'NO_STATUS_CHANGE' };
      }

      if (account.verificationStatus !== 'pending' && action.status === 'pending') {
        return { success: false, error: 'INVALID_TRANSITION' };
      }

      const updated = await prisma.account.update({
        where: { id: action.accountId },
        data: {
          verificationStatus: action.status,
          verificationLogs: {
            create: {
              reviewerId: action.reviewerId,
              status: action.status,
              note: action.note,
              reviewedAt: action.reviewedAt ? new Date(action.reviewedAt) : undefined,
            },
          },
        },
        include: { verificationLogs: { orderBy: { reviewedAt: 'desc' }, take: 1 } },
      });

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

  async list() {
    const accounts = await prisma.account.findMany({
      include: {
        consumerProfile: true,
        staffProfile: true,
        verificationLogs: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return accounts.map((acct) => ({
      id: acct.id,
      type: acct.role === 'consumer' ? 'consumer' : 'staff',
      verificationStatus: acct.verificationStatus as VerificationStatus,
      createdAt: acct.createdAt.toISOString(),
      updatedAt: acct.updatedAt.toISOString(),
      data: {
        firstName: acct.firstName,
        lastName: acct.lastName,
        email: acct.email,
        phone: acct.phone || undefined,
        address: acct.address,
        householdSize: acct.consumerProfile?.householdSize,
        staffRole: acct.staffProfile?.staffRole,
      },
      verificationLog: acct.verificationLogs.map((log) => ({
        id: log.id,
        accountId: log.accountId,
        reviewerId: log.reviewerId,
        status: log.status as VerificationStatus,
        note: log.note || undefined,
        reviewedAt: log.reviewedAt.toISOString(),
      })),
    }));
  },

  async findById(id: string) {
    return prisma.account.findUnique({
      where: { id },
      include: {
        consumerProfile: true,
        staffProfile: true,
        verificationLogs: true,
      },
    });
  },
};
