export type CurrentDateMode = "auto" | "manual";

export type SettingsKey = "currentDate.mode" | "currentDate.value" | "currency";

export type SettingsValue = string | null;

export type SettingsData = {
  currentDateMode: CurrentDateMode;
  currentDateValue: string | null;
  currency: string;
};

export type SettingsUpdateInput = {
  key: SettingsKey;
  value: SettingsValue;
};
