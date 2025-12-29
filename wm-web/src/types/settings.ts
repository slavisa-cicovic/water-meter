export type CurrentMonthMode = "auto" | "manual";

export type SettingsKey = "currentMonth.mode" | "currentMonth.value" | "currency";

export type SettingsValue = string | number | null;

export type SettingsData = {
  currentMonthMode: CurrentMonthMode;
  currentMonthValue: number | null;
  currency: string;
};

export type SettingsUpdateInput = {
  key: SettingsKey;
  value: SettingsValue;
};
