import { AccountRole } from "@prisma/client";
import prisma from "src/utils/prisma";
import { StaffRole, VerificationStatus } from "src/types/accounts";

type ListParams = {
  search?: string;
  orderBy?: "createdAt" | "verificationStatus" | "email" | "name" | "type";
  order?: "asc" | "desc";
  type?: "consumer" | "staff" | "admin" | "staff_backoffice" | "staff_field";
  status?: VerificationStatus;
  page?: number;
  pageSize?: number;
  allowedRoles?: AccountRole[];
};

export const AccountRepository = {
  async createConsumer(data: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    address: string;
    password: string;
    householdSize: number;
  }) {
    return prisma.account.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        passwordHash: data.password,
        role: "consumer",
        consumerProfile: {
          create: {
            householdSize: data.householdSize,
          },
        },
      },
    });
  },

  async createStaff(data: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    address: string;
    password: string;
    staffRole: StaffRole;
    role: "staff_field" | "staff_backoffice";
  }) {
    return prisma.account.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        passwordHash: data.password,
        role: data.role,
        staffProfile: {
          create: {
            staffRole: data.staffRole,
          },
        },
      },
    });
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

  async updateVerification(accountId: string, status: VerificationStatus, reviewerId: string, note?: string, reviewedAt?: string) {
    return prisma.account.update({
      where: { id: accountId },
      data: {
        verificationStatus: status,
        verificationLogs: {
          create: {
            reviewerId,
            status,
            note,
            reviewedAt: reviewedAt ? new Date(reviewedAt) : undefined,
          },
        },
      },
      include: { verificationLogs: { orderBy: { reviewedAt: "desc" }, take: 1 } },
    });
  },

  async updateConsumerHouseholdSize(accountId: string, householdSize: number) {
    return prisma.consumerProfile.upsert({
      where: { accountId },
      update: { householdSize },
      create: { accountId, householdSize },
    });
  },

  async updateAccountDetails(accountId: string, data: { firstName: string; lastName: string; address: string }) {
    return prisma.account.update({
      where: { id: accountId },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        address: data.address,
      },
      include: {
        consumerProfile: true,
        staffProfile: true,
        verificationLogs: true,
      },
    });
  },

  async updateConsumerProfile(
    accountId: string,
    data: { householdSize?: number; tariffId?: string | null }
  ) {
    return prisma.consumerProfile.upsert({
      where: { accountId },
      update: {
        ...(data.householdSize !== undefined ? { householdSize: data.householdSize } : {}),
        ...(data.tariffId !== undefined ? { tariffId: data.tariffId } : {}),
      },
      create: {
        accountId,
        householdSize: data.householdSize ?? 1,
        tariffId: data.tariffId ?? null,
      },
    });
  },

  async list(params: ListParams) {
    const {
      search,
      type,
      status,
      orderBy = "createdAt",
      order = "desc",
      page = 0,
      pageSize = 25,
      allowedRoles,
    } = params;

    const searchFilter = search
      ? {
          OR: [
            { firstName: { contains: search } },
            { lastName: { contains: search } },
            { email: { contains: search } },
            { address: { contains: search } },
          ],
        }
      : undefined;

    const where: any = {
      ...(searchFilter && searchFilter),
      ...(status && { verificationStatus: status }),
    };

    if (allowedRoles && allowedRoles.length) {
      where.role = { in: allowedRoles };
    } else if (type === "consumer") {
      where.role = AccountRole.consumer;
    } else if (type === "staff") {
      where.role = { in: [AccountRole.staff_field, AccountRole.staff_backoffice] };
    }

    const orderByClause =
      orderBy === "name"
        ? [
            { lastName: order },
            { firstName: order },
          ]
        : orderBy === "email"
        ? [{ email: order }]
        : orderBy === "verificationStatus"
        ? [{ verificationStatus: order }]
        : orderBy === "type"
        ? [{ role: order }]
        : [{ createdAt: order }];

    const [total, accounts] = await Promise.all([
      prisma.account.count({ where }),
      prisma.account.findMany({
        include: {
          consumerProfile: true,
          staffProfile: true,
          verificationLogs: true,
        },
        where,
        orderBy: orderByClause,
        skip: page * pageSize,
        take: pageSize,
      }),
    ]);

    return { total, accounts };
  },
};
