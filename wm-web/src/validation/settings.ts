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

  if (input.key === "currentMonth.mode") {
    if (input.value !== "auto" && input.value !== "manual") {
      pushError(errors, "value", "Must be auto or manual");
    }
  } else if (input.key === "currentMonth.value") {
    if (input.value === null) {
      return { valid: true, errors };
    }
    if (typeof input.value !== "number" || !Number.isInteger(input.value)) {
      pushError(errors, "value", "Must be an integer month");
    } else if (input.value < 1 || input.value > 12) {
      pushError(errors, "value", "Month must be between 1 and 12");
    }
  } else if (input.key === "currency") {
    if (typeof input.value !== "string" || input.value.trim().length === 0) {
      pushError(errors, "value", "Required");
    }
  }

  return { valid: Object.keys(errors).length === 0, errors };
};
