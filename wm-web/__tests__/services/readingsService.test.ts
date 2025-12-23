import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ReadingsService } from 'src/services/readingsService';
import { ReadingRepository } from 'src/repositories/readingRepository';
import { AccountRepository } from 'src/repositories/accountRepository';

describe('ReadingsService validation', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('requires imageFilename for photo_ocr', async () => {
    const result = await ReadingsService.create({
      meterId: 'm1',
      readerAccountId: 'c1',
      readAt: new Date().toISOString(),
      method: 'photo_ocr',
      value: 100,
    });

    expect(result.success).toBe(false);
    expect((result as any).error).toBe('VALIDATION_FAILED');
  });

  it('rejects non-consumer/staff_field reader', async () => {
    vi.spyOn(AccountRepository, 'findById').mockResolvedValue({ id: 'a1', role: 'admin' } as any);

    const result = await ReadingsService.create({
      meterId: 'm1',
      readerAccountId: 'a1',
      readAt: new Date().toISOString(),
      method: 'manual',
      value: 120,
    });

    expect(result.success).toBe(false);
    expect((result as any).error).toBe('READER_FORBIDDEN');
  });
});

describe('ReadingsService edits', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('creates ReadingEdit when value changes', async () => {
    vi.spyOn(ReadingRepository, 'findById').mockResolvedValue({
      id: 'r1',
      meterId: 'm1',
      readerAccountId: 'c1',
      readAt: new Date(),
      method: 'manual',
      value: 200,
      originalValue: 200,
      imageFilename: null,
      edits: [],
    } as any);
    vi.spyOn(AccountRepository, 'findById').mockResolvedValue({ id: 's1', role: 'staff_backoffice' } as any);
    const editSpy = vi.spyOn(ReadingRepository, 'addEdit').mockResolvedValue({ id: 'e1' } as any);
    vi.spyOn(ReadingRepository, 'update').mockResolvedValue({
      id: 'r1',
      meterId: 'm1',
      readerAccountId: 'c1',
      readAt: new Date(),
      method: 'manual',
      value: 210,
      originalValue: 200,
      imageFilename: null,
      edits: [],
    } as any);

    const result = await ReadingsService.update({
      id: 'r1',
      value: 210,
      editorAccountId: 's1',
      editorRole: 'staff_backoffice',
      editReason: 'Correction',
    });

    expect(result.success).toBe(true);
    expect(editSpy).toHaveBeenCalled();
  });
});

