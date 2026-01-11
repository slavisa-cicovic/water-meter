export type CurrentDateMode = "auto" | "manual";

export type SettingsKey =
  | "currentDate.mode"
  | "currentDate.value"
  | "currency"
  | "ai.systemPrompt";

export type SettingsValue = string | null;

export type SettingsData = {
  currentDateMode: CurrentDateMode;
  currentDateValue: string | null;
  currency: string;
  aiSystemPrompt: string | null;
};

export type SettingsUpdateInput = {
  key: SettingsKey;
  value: SettingsValue;
};
