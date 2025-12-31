import { AccountRepository } from 'src/repositories/accountRepository';
import { ReadingRepository } from 'src/repositories/readingRepository';
import { Reading, ReadingCreateInput, ReadingListParams, ReadingUpdateInput } from 'src/types/readings';
import { SettingsService } from 'src/services/settingsService';
import { validateReadingCreate, validateReadingUpdate } from 'src/validation/readings';
import prisma from 'src/utils/prisma';

const toReading = (row: any): Reading => ({
  id: row.id,
  meterId: row.meterId,
  readerAccountId: row.readerAccountId,
  readAt: row.readAt?.toISOString?.() ?? row.readAt,
  method: row.method,
  value: row.value,
  originalValue: row.originalValue,
  imageFilename: row.imageFilename ?? undefined,
  createdAt: row.createdAt?.toISOString?.() ?? row.createdAt ?? undefined,
  updatedAt: row.updatedAt?.toISOString?.() ?? row.updatedAt ?? undefined,
  meter: row.meter
    ? {
        serialNumber: row.meter.serialNumber,
        groupCode: row.meter.groupCode ?? undefined,
        address: row.meter.address ?? undefined,
      }
    : undefined,
  edits: row.edits?.map((edit: any) => ({
    id: edit.id,
    readingId: edit.readingId,
    accountId: edit.accountId,
    editorRole: edit.editorRole,
    editorFirstName: edit.account?.firstName ?? undefined,
    editorLastName: edit.account?.lastName ?? undefined,
    value: edit.value,
    reason: edit.reason ?? undefined,
    editedAt: edit.editedAt?.toISOString?.() ?? edit.editedAt,
  })),
});

const allowedReaderRoles = new Set(['consumer', 'staff_field']);
const allowedEditorRoles = new Set(['consumer', 'staff_field', 'staff_backoffice']);

export const ReadingsService = {
  async create(input: ReadingCreateInput) {
    const validation = validateReadingCreate(input);
    if (!validation.valid) {
      return { success: false, error: 'VALIDATION_FAILED', details: validation.errors };
    }

    const reader = await AccountRepository.findById(input.readerAccountId);
    if (!reader) return { success: false, error: 'ACCOUNT_NOT_FOUND' };
    if (!allowedReaderRoles.has(reader.role)) return { success: false, error: 'READER_FORBIDDEN' };

    try {
      const reading = await ReadingRepository.create(input);
      return { success: true, data: { reading: toReading(reading) } };
    } catch (error: any) {
      return { success: false, error: 'SERVER_ERROR' };
    }
  },

  async update(input: ReadingUpdateInput) {
    if (input.readAt !== undefined) {
      const effectiveDateResult = await SettingsService.getEffectiveDate();
      if (effectiveDateResult.success) {
        input.readAt = effectiveDateResult.data.toISOString();
      }
    }

    const validation = validateReadingUpdate(input);
    if (!validation.valid) {
      return { success: false, error: 'VALIDATION_FAILED', details: validation.errors };
    }

    return prisma.$transaction(async (tx) => {
      const existing = await ReadingRepository.findById(input.id, tx);
      if (!existing) return { success: false, error: 'NOT_FOUND' };

      if (existing.method === 'photo_ocr' && input.imageFilename === null) {
        return { success: false, error: 'IMAGE_REQUIRED' };
      }

      const valueChanged = input.value !== undefined && input.value !== existing.value;
      const reasonProvided = typeof input.editReason === 'string' && input.editReason.trim().length > 0;

      if (input.value !== undefined && (valueChanged || reasonProvided)) {
        const editor = await AccountRepository.findById(input.editorAccountId || '');
        if (!editor) return { success: false, error: 'ACCOUNT_NOT_FOUND' };
        if (!allowedEditorRoles.has(editor.role)) return { success: false, error: 'EDITOR_FORBIDDEN' };
        if (input.editorRole && input.editorRole !== editor.role) {
          return { success: false, error: 'EDITOR_ROLE_MISMATCH' };
        }

        await ReadingRepository.addEdit(
          {
            readingId: existing.id,
            accountId: editor.id,
            editorRole: editor.role,
            value: input.value as number,
            reason: input.editReason,
          },
          tx
        );
      }

      const updated = await ReadingRepository.update(input, tx);
      return { success: true, data: { reading: toReading(updated) } };
    });
  },

  async findById(id: string) {
    if (!id) return { success: false, error: 'VALIDATION_FAILED', details: { id: ['Required'] } };
    const reading = await ReadingRepository.findById(id);
    if (!reading) return { success: false, error: 'NOT_FOUND' };
    return { success: true, data: { reading: toReading(reading) } };
  },

  async list(params: ReadingListParams = {}) {
    const { readings, total } = await ReadingRepository.list(params);
    return { success: true, data: { readings: readings.map(toReading), total } };
  },
};
