import { Prisma } from "@prisma/client";
import prisma from "src/utils/prisma";
import { SettingsKey, SettingsValue } from "src/types/settings";

const toJsonValue = (
  value: SettingsValue
): Prisma.InputJsonValue | Prisma.JsonNullValueInput =>
  value === null ? Prisma.JsonNull : value;

export const SettingsRepository = {
  async list(keys: SettingsKey[]) {
    return prisma.appSetting.findMany({
      where: { key: { in: keys } },
      select: { key: true, value: true },
    });
  },

  async upsert(key: SettingsKey, value: SettingsValue) {
    return prisma.appSetting.upsert({
      where: { key },
      update: { value: toJsonValue(value) },
      create: { key, value: toJsonValue(value) },
    });
  },
};
