import { Prisma } from "@prisma/client";
import { SettingsRepository } from "src/repositories/settingsRepository";
import {
  CurrentDateMode,
  SettingsData,
  SettingsKey,
  SettingsUpdateInput,
  SettingsValue,
} from "src/types/settings";
import { validateSettingsUpdate } from "src/validation/settings";

type ServiceResult<T> = { success: true; data: T } | { success: false; error: string; details?: Record<string, string[]> };

const DEFAULTS: SettingsData = {
  currentDateMode: "auto",
  currentDateValue: null,
  currency: "RSD",
  aiSystemPrompt: null,
  companyLogoUrl: "",
  companyName: "",
  companyAddress: "",
  companyZip: "",
  companyCity: "",
  companyRegistrationNumber: "",
  companyCompanyNumber: "",
  companyTaxId: "",
};

const SETTINGS_KEYS: SettingsKey[] = [
  "currentDate.mode",
  "currentDate.value",
  "currency",
  "ai.systemPrompt",
  "company.logoUrl",
  "company.name",
  "company.address",
  "company.zip",
  "company.city",
  "company.registrationNumber",
  "company.companyNumber",
  "company.taxId",
];

const resolveString = (value: Prisma.JsonValue, fallback: string) =>
  typeof value === "string" ? value : fallback;

const resolveMode = (value: Prisma.JsonValue, fallback: CurrentDateMode) =>
  value === "auto" || value === "manual" ? value : fallback;

export const SettingsService = {
  async getSettings(): Promise<ServiceResult<SettingsData>> {
    const entries = await SettingsRepository.list(SETTINGS_KEYS);
    const map = new Map(entries.map((entry) => [entry.key, entry.value]));

    return {
      success: true,
      data: {
        currentDateMode: resolveMode(map.get("currentDate.mode") ?? DEFAULTS.currentDateMode, DEFAULTS.currentDateMode),
        currentDateValue: resolveString(
          map.get("currentDate.value") ?? DEFAULTS.currentDateValue ?? "",
          DEFAULTS.currentDateValue ?? ""
        ) || DEFAULTS.currentDateValue,
        currency: resolveString(map.get("currency") ?? DEFAULTS.currency, DEFAULTS.currency),
        aiSystemPrompt: resolveString(map.get("ai.systemPrompt") ?? DEFAULTS.aiSystemPrompt ?? "", "") || null,
        companyLogoUrl: resolveString(map.get("company.logoUrl") ?? DEFAULTS.companyLogoUrl, DEFAULTS.companyLogoUrl),
        companyName: resolveString(map.get("company.name") ?? DEFAULTS.companyName, DEFAULTS.companyName),
        companyAddress: resolveString(map.get("company.address") ?? DEFAULTS.companyAddress, DEFAULTS.companyAddress),
        companyZip: resolveString(map.get("company.zip") ?? DEFAULTS.companyZip, DEFAULTS.companyZip),
        companyCity: resolveString(map.get("company.city") ?? DEFAULTS.companyCity, DEFAULTS.companyCity),
        companyRegistrationNumber: resolveString(
          map.get("company.registrationNumber") ?? DEFAULTS.companyRegistrationNumber,
          DEFAULTS.companyRegistrationNumber
        ),
        companyCompanyNumber: resolveString(
          map.get("company.companyNumber") ?? DEFAULTS.companyCompanyNumber,
          DEFAULTS.companyCompanyNumber
        ),
        companyTaxId: resolveString(map.get("company.taxId") ?? DEFAULTS.companyTaxId, DEFAULTS.companyTaxId),
      },
    };
  },

  async getEffectiveDate(now: Date = new Date()): Promise<ServiceResult<Date>> {
    const settings = await this.getSettings();
    if (!settings.success) {
      return { success: false, error: settings.error, details: settings.details };
    }

    if (settings.data.currentDateMode !== "manual" || !settings.data.currentDateValue) {
      return { success: true, data: now };
    }

    const parsed = new Date(`${settings.data.currentDateValue}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) {
      return { success: true, data: now };
    }

    return {
      success: true,
      data: new Date(
        parsed.getFullYear(),
        parsed.getMonth(),
        parsed.getDate(),
        now.getHours(),
        now.getMinutes(),
        now.getSeconds(),
        now.getMilliseconds()
      ),
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

  async getAiSystemPrompt(): Promise<ServiceResult<string | null>> {
    const entries = await SettingsRepository.list(["ai.systemPrompt"]);
    const entry = entries[0];
    const value = entry?.value;
    if (typeof value === "string" && value.trim()) {
      return { success: true, data: value.trim() };
    }
    return { success: true, data: null };
  },
};
