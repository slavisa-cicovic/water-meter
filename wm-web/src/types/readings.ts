export type ReadingMethod = 'remote' | 'manual' | 'photo_ocr';

export type Reading = {
  id: string;
  meterId: string;
  meter?: {
    serialNumber?: string;
    groupCode?: string;
    address?: string;
  };
  readerAccountId: string;
  readAt: string;
  method: ReadingMethod;
  value: number;
  originalValue: number;
  imageFilename?: string;
  createdAt?: string;
  updatedAt?: string;
  edits?: ReadingEdit[];
};

export type ReadingEdit = {
  id: string;
  readingId: string;
  accountId: string;
  editorRole: 'admin' | 'consumer' | 'staff_field' | 'staff_backoffice';
  editorFirstName?: string;
  editorLastName?: string;
  value: number;
  reason?: string;
  editedAt: string;
};

export type ReadingCreateInput = {
  meterId: string;
  readerAccountId: string;
  readAt: string;
  method: ReadingMethod;
  value: number;
  originalValue?: number;
  imageFilename?: string | null;
};

export type ReadingUpdateInput = {
  id: string;
  value?: number;
  readAt?: string;
  imageFilename?: string | null;
  editReason?: string;
  editorAccountId?: string;
  editorRole?: ReadingEdit['editorRole'];
};

export type ReadingListParams = {
  meterId?: string;
  accountId?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
};

export type ValidationResult = {
  valid: boolean;
  errors: Record<string, string[]>;
};
