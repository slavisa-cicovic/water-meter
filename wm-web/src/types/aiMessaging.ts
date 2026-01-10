export type AiMessageInput = {
  body: string;
};

export type AiValidationResult = {
  valid: boolean;
  errors: Record<string, string[]>;
};
