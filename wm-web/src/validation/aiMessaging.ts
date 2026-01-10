import { AiMessageInput, AiValidationResult } from 'src/types/aiMessaging';

const MIN_BODY_LENGTH = 2;
const MAX_BODY_LENGTH = 2000;

const isBlank = (value: string | undefined | null): boolean => !value || !value.trim();

const pushError = (errors: Record<string, string[]>, field: string, message: string) => {
  if (!errors[field]) {
    errors[field] = [];
  }
  errors[field].push(message);
};

export const validateAiMessageInput = (input: AiMessageInput): AiValidationResult => {
  const errors: Record<string, string[]> = {};

  if (isBlank(input.body)) {
    pushError(errors, 'body', 'Required');
  } else if (input.body.trim().length < MIN_BODY_LENGTH) {
    pushError(errors, 'body', 'Too short');
  } else if (input.body.trim().length > MAX_BODY_LENGTH) {
    pushError(errors, 'body', 'Too long');
  }

  return { valid: Object.keys(errors).length === 0, errors };
};
