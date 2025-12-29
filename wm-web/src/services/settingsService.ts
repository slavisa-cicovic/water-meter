import { Prisma } from "@prisma/client";
import { SettingsRepository } from "src/repositories/settingsRepository";
import {
  CurrentMonthMode,
  SettingsData,
  SettingsKey,
  SettingsUpdateInput,
  SettingsValue,
} from "src/types/settings";
import { validateSettingsUpdate } from "src/validation/settings";

type ServiceResult<T> = { success: true; data: T } | { success: false; error: string; details?: Record<string, string[]> };

const DEFAULTS: SettingsData = {
  currentMonthMode: "auto",
  currentMonthValue: null,
  currency: "RSD",
};

const SETTINGS_KEYS: SettingsKey[] = ["currentMonth.mode", "currentMonth.value", "currency"];

const resolveString = (value: Prisma.JsonValue, fallback: string) =>
  typeof value === "string" ? value : fallback;

const resolveNumber = (value: Prisma.JsonValue, fallback: number | null) =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback;

const resolveMode = (value: Prisma.JsonValue, fallback: CurrentMonthMode) =>
  value === "auto" || value === "manual" ? value : fallback;

export const SettingsService = {
  async getSettings(): Promise<ServiceResult<SettingsData>> {
    const entries = await SettingsRepository.list(SETTINGS_KEYS);
    const map = new Map(entries.map((entry) => [entry.key, entry.value]));

    return {
      success: true,
      data: {
        currentMonthMode: resolveMode(map.get("currentMonth.mode") ?? DEFAULTS.currentMonthMode, DEFAULTS.currentMonthMode),
        currentMonthValue: resolveNumber(map.get("currentMonth.value") ?? DEFAULTS.currentMonthValue, DEFAULTS.currentMonthValue),
        currency: resolveString(map.get("currency") ?? DEFAULTS.currency, DEFAULTS.currency),
      },
    };
  },

  async updateSetting(input: SettingsUpdateInput): Promise<ServiceResult<{ key: SettingsKey; value: SettingsValue }>> {
    const validation = validateSettingsUpdate(input);
    if (!validation.valid) {
      return { success: false, error: "VALIDATION_FAILED", details: validation.errors };
    }

    await SettingsRepository.upsert(input.key, input.value);
    return { success: true, data: { key: input.key, value: input.value } };
  },
};
