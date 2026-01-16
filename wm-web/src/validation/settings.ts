import { SettingsUpdateInput } from "src/types/settings";

type ValidationResult = {
  valid: boolean;
  errors: Record<string, string[]>;
};

const pushError = (errors: Record<string, string[]>, field: string, message: string) => {
  if (!errors[field]) errors[field] = [];
  errors[field].push(message);
};

export const validateSettingsUpdate = (input: SettingsUpdateInput): ValidationResult => {
  const errors: Record<string, string[]> = {};

  if (!input.key) {
    pushError(errors, "key", "Required");
    return { valid: false, errors };
  }

  if (input.key === "currentDate.mode") {
    if (input.value !== "auto" && input.value !== "manual") {
      pushError(errors, "value", "Must be auto or manual");
    }
  } else if (input.key === "currentDate.value") {
    if (input.value === null) {
      return { valid: true, errors };
    }
    if (typeof input.value !== "string") {
      pushError(errors, "value", "Must be a date string");
    } else if (!isValidDate(input.value)) {
      pushError(errors, "value", "Must be a valid ISO date (YYYY-MM-DD)");
    }
  } else if (input.key === "currency") {
    if (typeof input.value !== "string" || input.value.trim().length === 0) {
      pushError(errors, "value", "Required");
    }
  } else if (input.key === "ai.systemPrompt") {
    if (input.value === null) {
      return { valid: true, errors };
    }
    if (typeof input.value !== "string") {
      pushError(errors, "value", "Must be a string");
    }
  } else if (input.key.startsWith("company.")) {
    if (input.value === null) {
      return { valid: true, errors };
    }
    if (typeof input.value !== "string") {
      pushError(errors, "value", "Must be a string");
    }
  }

  return { valid: Object.keys(errors).length === 0, errors };
};

const isValidDate = (value: string) => {
  const match = /^\d{4}-\d{2}-\d{2}$/.test(value);
  if (!match) return false;
  const parsed = new Date(`${value}T00:00:00`);
  return !Number.isNaN(parsed.getTime());
};
