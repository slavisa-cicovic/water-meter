export type CurrentDateMode = "auto" | "manual";

export type SettingsKey =
  | "currentDate.mode"
  | "currentDate.value"
  | "currency"
  | "ai.systemPrompt"
  | "company.logoUrl"
  | "company.name"
  | "company.address"
  | "company.zip"
  | "company.city"
  | "company.registrationNumber"
  | "company.companyNumber"
  | "company.taxId";

export type SettingsValue = string | null;

export type SettingsData = {
  currentDateMode: CurrentDateMode;
  currentDateValue: string | null;
  currency: string;
  aiSystemPrompt: string | null;
  companyLogoUrl: string;
  companyName: string;
  companyAddress: string;
  companyZip: string;
  companyCity: string;
  companyRegistrationNumber: string;
  companyCompanyNumber: string;
  companyTaxId: string;
};

export type SettingsUpdateInput = {
  key: SettingsKey;
  value: SettingsValue;
};
