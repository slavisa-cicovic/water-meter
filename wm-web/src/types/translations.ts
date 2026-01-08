export type TranslationTarget = "mobile" | "web";

export type TranslationBundle = {
  target: TranslationTarget;
  locale: string;
  updatedAt: string | null;
  translations: Record<string, string>;
};

export type TranslationUpdate = {
  key: string;
  value: string;
};

export type TranslationUpdateInput = {
  target: TranslationTarget;
  locale: string;
  updates: TranslationUpdate[];
};
