import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ReadingsService } from 'src/services/readingsService';
import { ReadingRepository } from 'src/repositories/readingRepository';
import { AccountRepository } from 'src/repositories/accountRepository';
import { AuthorizationService } from 'src/services/authorizationService';
import { PERMISSIONS } from 'src/constants/permissions';

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

  it('rejects reader without permission', async () => {
    vi.spyOn(AccountRepository, 'findById').mockResolvedValue({ id: 'a1' } as any);
    vi.spyOn(AuthorizationService, 'resolveAccountPermissions').mockResolvedValue([]);

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

  it('allows mobile create with mobile permission', async () => {
    vi.spyOn(AccountRepository, 'findById').mockResolvedValue({ id: 'm1' } as any);
    vi.spyOn(AuthorizationService, 'resolveAccountPermissions').mockResolvedValue([
      PERMISSIONS.MOBILE_READINGS_CREATE,
    ]);
    vi.spyOn(ReadingRepository, 'create').mockResolvedValue({
      id: 'r1',
      meterId: 'm1',
      readerAccountId: 'm1',
      readAt: new Date(),
      method: 'manual',
      value: 100,
      originalValue: 100,
      imageFilename: null,
      edits: [],
    } as any);

    const result = await ReadingsService.create(
      {
        meterId: 'm1',
        readerAccountId: 'm1',
        readAt: new Date().toISOString(),
        method: 'manual',
        value: 100,
      },
      { permissionSlug: PERMISSIONS.MOBILE_READINGS_CREATE }
    );

    expect(result.success).toBe(true);
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
    vi.spyOn(AccountRepository, 'findById').mockResolvedValue({
      id: 's1',
      accountRoleLinks: [{ role: { slug: 'staff_backoffice' } }],
    } as any);
    vi.spyOn(AuthorizationService, 'resolveAccountPermissions').mockResolvedValue([
      PERMISSIONS.READINGS_UPDATE,
    ]);
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
