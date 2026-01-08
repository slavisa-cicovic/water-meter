export type TranslationBundle = {
  locale: string;
  updatedAt: string | null;
  translations: Record<string, string>;
};

export type TranslationUpdate = {
  key: string;
  value: string;
};

export type TranslationUpdateInput = {
  locale: string;
  updates: TranslationUpdate[];
};
