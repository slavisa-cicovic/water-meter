import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AccountsService } from 'src/services/accountsService';
import { AccountRepository } from 'src/repositories/accountRepository';
import { AccountRole, VerificationStatus } from '@prisma/client';

describe('AccountsService list role constraints', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('staff_backoffice restricts repository roles to consumer + staff_field', async () => {
    const spy = vi
      .spyOn(AccountRepository, 'list')
      .mockResolvedValue({ accounts: [], total: 0 });

    await AccountsService.list({ viewerRole: 'staff_backoffice' });

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        allowedRoles: [AccountRole.consumer, AccountRole.staff_field],
      })
    );
  });

  it('admin restricts repository roles to admin + staff_backoffice', async () => {
    const spy = vi
      .spyOn(AccountRepository, 'list')
      .mockResolvedValue({ accounts: [], total: 0 });

    await AccountsService.list({ viewerRole: 'admin' });

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        allowedRoles: [AccountRole.admin, AccountRole.staff_backoffice],
      })
    );
  });
});

describe('AccountsService findById visibility', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('staff_backoffice cannot see admin accounts', async () => {
    vi.spyOn(AccountRepository, 'findById').mockResolvedValue({
      id: 'admin-1',
      role: 'admin',
    } as any);

    const result = await AccountsService.findById('admin-1', 'staff_backoffice');
    expect(result).toBeNull();
  });

  it('staff_backoffice can see staff_field', async () => {
    vi.spyOn(AccountRepository, 'findById').mockResolvedValue({
      id: 'staff-1',
      firstName: 'Field',
      lastName: 'User',
      email: 'f@example.com',
      role: 'staff_field',
      verificationStatus: 'verified' as VerificationStatus,
    } as any);

    const result = await AccountsService.findById('staff-1', 'staff_backoffice');
    expect(result?.id).toBe('staff-1');
  });

  it('admin cannot see consumers', async () => {
    vi.spyOn(AccountRepository, 'findById').mockResolvedValue({
      id: 'cons-1',
      role: 'consumer',
    } as any);

    const result = await AccountsService.findById('cons-1', 'admin');
    expect(result).toBeNull();
  });
});
