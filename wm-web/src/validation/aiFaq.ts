import { AiFaqCreateInput, AiFaqUpdateInput } from "src/types/aiFaq";

type ValidationResult = {
  valid: boolean;
  errors: Record<string, string[]>;
};

const pushError = (errors: Record<string, string[]>, field: string, message: string) => {
  if (!errors[field]) errors[field] = [];
  errors[field].push(message);
};

const validateRequiredString = (value: string, field: string, errors: Record<string, string[]>) => {
  if (!value || !value.trim()) {
    pushError(errors, field, "Required");
  }
};

export const validateAiFaqCreate = (input: AiFaqCreateInput): ValidationResult => {
  const errors: Record<string, string[]> = {};
  validateRequiredString(input.question, "question", errors);
  validateRequiredString(input.answer, "answer", errors);
  return { valid: Object.keys(errors).length === 0, errors };
};

export const validateAiFaqUpdate = (input: AiFaqUpdateInput): ValidationResult => {
  const errors: Record<string, string[]> = {};
  if (!input.id) {
    pushError(errors, "id", "Required");
  }
  validateRequiredString(input.question, "question", errors);
  validateRequiredString(input.answer, "answer", errors);
  return { valid: Object.keys(errors).length === 0, errors };
};
