import { ReadingCreateInput, ReadingEdit, ReadingMethod, ReadingUpdateInput, ValidationResult } from 'src/types/readings';

const isBlank = (value: string | undefined | null): boolean => !value || !value.trim();

const pushError = (errors: Record<string, string[]>, field: string, message: string) => {
  if (!errors[field]) errors[field] = [];
  errors[field].push(message);
};

const validateMethod = (method: ReadingMethod, errors: Record<string, string[]>) => {
  const allowed: ReadingMethod[] = ['remote', 'manual', 'photo_ocr'];
  if (!allowed.includes(method)) pushError(errors, 'method', 'Invalid method');
};

const validateDate = (value: string, field: string, errors: Record<string, string[]>) => {
  if (isBlank(value)) {
    pushError(errors, field, 'Required');
    return;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) pushError(errors, field, 'Invalid date');
};

const validateValue = (value: number | undefined, field: string, errors: Record<string, string[]>) => {
  if (value === undefined || value === null) {
    pushError(errors, field, 'Required');
    return;
  }
  if (!Number.isFinite(value) || value < 0) {
    pushError(errors, field, 'Must be a non-negative number');
    return;
  }
  const scaled = Math.round(value * 100);
  if (Math.abs(value * 100 - scaled) > 1e-6) {
    pushError(errors, field, 'Must have at most 2 decimal places');
  }
};

const validateImage = (method: ReadingMethod, imageFilename: string | null | undefined, errors: Record<string, string[]>) => {
  if (method === 'photo_ocr') {
    if (isBlank(imageFilename ?? undefined)) {
      pushError(errors, 'imageFilename', 'Required for photo_ocr');
    }
  }
};

const validateEditorRole = (role: ReadingEdit['editorRole'] | undefined, errors: Record<string, string[]>) => {
  if (!role) {
    pushError(errors, 'editorRole', 'Required');
    return;
  }
  const allowed: ReadingEdit['editorRole'][] = ['consumer', 'staff_field', 'staff_backoffice', 'admin'];
  if (!allowed.includes(role)) pushError(errors, 'editorRole', 'Invalid editor role');
};

const validateBarcodeStatus = (status: ReadingUpdateInput['barcodeStatus'], errors: Record<string, string[]>) => {
  if (!status) return;
  const allowed: NonNullable<ReadingUpdateInput['barcodeStatus']>[] = ['pending', 'accepted', 'rejected'];
  if (!allowed.includes(status)) pushError(errors, 'barcodeStatus', 'Invalid barcode status');
};

export const validateReadingCreate = (input: ReadingCreateInput): ValidationResult => {
  const errors: Record<string, string[]> = {};

  if (isBlank(input.meterId)) pushError(errors, 'meterId', 'Required');
  if (isBlank(input.readerAccountId)) pushError(errors, 'readerAccountId', 'Required');

  validateDate(input.readAt, 'readAt', errors);
  validateMethod(input.method, errors);
  validateValue(input.value, 'value', errors);
  validateImage(input.method, input.imageFilename, errors);
  if (input.barcodeRaw !== undefined && input.barcodeRaw !== null && isBlank(input.barcodeRaw)) {
    pushError(errors, 'barcodeRaw', 'Must be null or a barcode');
  }

  return { valid: Object.keys(errors).length === 0, errors };
};

export const validateReadingUpdate = (input: ReadingUpdateInput): ValidationResult => {
  const errors: Record<string, string[]> = {};

  if (isBlank(input.id)) pushError(errors, 'id', 'Required');
  if (input.readAt !== undefined) validateDate(input.readAt, 'readAt', errors);
  if (input.value !== undefined) validateValue(input.value, 'value', errors);

  if (input.value !== undefined) {
    if (isBlank(input.editorAccountId)) pushError(errors, 'editorAccountId', 'Required when editing value');
    validateEditorRole(input.editorRole, errors);
    if (isBlank(input.editReason)) pushError(errors, 'editReason', 'Required when editing value');
  }

  if (input.imageFilename !== undefined && input.imageFilename !== null && isBlank(input.imageFilename)) {
    pushError(errors, 'imageFilename', 'Must be null or a filename');
  }

  if (input.barcodeFinal !== undefined && input.barcodeFinal !== null && isBlank(input.barcodeFinal)) {
    pushError(errors, 'barcodeFinal', 'Must be null or a barcode');
  }
  if (input.barcodeStatus !== undefined) {
    validateBarcodeStatus(input.barcodeStatus, errors);
  }
  if (input.barcodeFinal !== undefined || input.barcodeStatus !== undefined) {
    if (isBlank(input.editorAccountId)) pushError(errors, 'editorAccountId', 'Required when reviewing barcode');
    validateEditorRole(input.editorRole, errors);
  }

  return { valid: Object.keys(errors).length === 0, errors };
};
