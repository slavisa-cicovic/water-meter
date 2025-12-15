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
        allowedRoles: expect.arrayContaining([AccountRole.consumer, AccountRole.staff_field, AccountRole.staff_backoffice]),
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
        allowedRoles: expect.arrayContaining([
          AccountRole.admin,
          AccountRole.staff_backoffice,
        ]),
      })
    );
  });

  it('maps avatar for non-consumer accounts and omits for consumers', async () => {
    vi.spyOn(AccountRepository, 'list').mockResolvedValue({
      total: 2,
      accounts: [
        {
          id: 'staff-1',
          firstName: 'Staff',
          lastName: 'User',
          email: 'staff@example.com',
          address: 'Addr',
          role: 'staff_backoffice',
          verificationStatus: 'verified',
          avatarUrl: 'https://cdn.example.com/a.png',
          createdAt: new Date(),
          updatedAt: new Date(),
          consumerProfile: null,
          staffProfile: { staffRole: 'backoffice' },
          verificationLogs: [],
        },
        {
          id: 'cons-1',
          firstName: 'Consumer',
          lastName: 'User',
          email: 'cons@example.com',
          address: 'Addr',
          role: 'consumer',
          verificationStatus: 'pending',
          avatarUrl: 'https://cdn.example.com/should-not-leak.png',
          createdAt: new Date(),
          updatedAt: new Date(),
          consumerProfile: { householdSize: 3 },
          staffProfile: null,
          verificationLogs: [],
        },
      ],
    } as any);

    const { accounts } = await AccountsService.list();

    const staff = accounts.find((a) => a.id === 'staff-1')!;
    expect(staff.type).toBe('staff_backoffice');
    expect((staff as any).avatar).toBe('https://cdn.example.com/a.png');

    const consumer = accounts.find((a) => a.id === 'cons-1')!;
    expect(consumer.type).toBe('consumer');
    expect('avatar' in consumer).toBe(false);
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
