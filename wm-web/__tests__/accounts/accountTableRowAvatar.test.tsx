import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import AccountTableRow from 'src/sections/accounts/account-table-row';
import { AccountRow } from 'src/types/accounts';

function renderRow(row: AccountRow) {
  return render(
    <table>
      <tbody>
        <AccountTableRow row={row} onVerify={() => undefined} />
      </tbody>
    </table>
  );
}

describe('AccountTableRow avatar column', () => {
  it('renders image avatar for non-consumer when avatar is present', () => {
    const row: AccountRow = {
      id: 's1',
      type: 'staff_backoffice',
      verificationStatus: 'verified',
      avatar: 'https://cdn.example.com/a.png',
      createdAt: new Date().toISOString(),
      data: {
        firstName: 'Staff',
        lastName: 'User',
        email: 'staff@example.com',
        address: 'Addr',
        staffRole: 'backoffice',
      },
    };

    renderRow(row);
    const img = screen.getByRole('img', { name: /staff user/i });
    expect(img).toHaveAttribute('src', 'https://cdn.example.com/a.png');
  });

  it('renders fallback initials for consumers (no avatar image)', () => {
    const row: AccountRow = {
      id: 'c1',
      type: 'consumer',
      verificationStatus: 'pending',
      createdAt: new Date().toISOString(),
      data: {
        firstName: 'Consumer',
        lastName: 'User',
        email: 'cons@example.com',
        address: 'Addr',
        householdSize: 3,
      },
    };

    renderRow(row);
    expect(screen.queryByRole('img', { name: /consumer user/i })).toBeNull();
    expect(screen.getByText('CU')).toBeInTheDocument();
  });
});

