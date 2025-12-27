import { MobileRepository } from "src/repositories/mobileRepository";
import { MobileAccountData, MobileProfileUpdateInput } from "src/types/mobile";
import { validateMobileProfileUpdate } from "src/validation/mobile";
import { Prisma } from "@prisma/client";

type ServiceResult<T> = { success: true; data: T } | { success: false; error: string; details?: Record<string, string[]> };

const toMobileAccountData = (record: {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  meter: MobileAccountData["meter"];
}): MobileAccountData => ({
  id: record.id,
  firstName: record.firstName,
  lastName: record.lastName,
  email: record.email,
  meter: record.meter ?? null,
});

export const MobileService = {
  async getAccount(accountId: string): Promise<ServiceResult<MobileAccountData>> {
    const account = await MobileRepository.findMobileAccount(accountId);
    if (!account) {
      return { success: false, error: "NOT_FOUND" };
    }
    return { success: true, data: toMobileAccountData(account) };
  },

  async updateProfile(accountId: string, input: MobileProfileUpdateInput): Promise<ServiceResult<MobileAccountData>> {
    const validation = validateMobileProfileUpdate(input);
    if (!validation.valid) {
      return { success: false, error: "VALIDATION_FAILED", details: validation.errors };
    }

    try {
      const updated = await MobileRepository.updateProfile(accountId, input);
      if (!updated) {
        return { success: false, error: "NOT_FOUND" };
      }
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        return { success: false, error: "ACCOUNT_EXISTS" };
      }
      return { success: false, error: "SERVER_ERROR" };
    }

    const refreshed = await MobileRepository.findMobileAccount(accountId);
    if (!refreshed) {
      return { success: false, error: "NOT_FOUND" };
    }
    return { success: true, data: toMobileAccountData(refreshed) };
  },
};
