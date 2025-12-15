import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { paths } from 'src/routes/paths';

const pushMock = vi.fn();
const logoutMock = vi.fn().mockResolvedValue(undefined);

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock('src/auth/hooks', () => ({
  useAuthContext: () => ({
    user: { firstName: 'Test', lastName: 'User', email: 'test@example.com' },
    logout: logoutMock,
  }),
}));

import { AccountPopover } from 'src/layouts/_common/account-popover';

describe('AccountPopover', () => {
  beforeEach(() => {
    pushMock.mockClear();
    logoutMock.mockClear();
  });

  it('logs out and redirects to login', async () => {
    render(<AccountPopover />);

    await userEvent.click(screen.getByLabelText(/account/i));
    await userEvent.click(await screen.findByRole('menuitem', { name: /logout/i }));

    expect(logoutMock).toHaveBeenCalledTimes(1);
    expect(pushMock).toHaveBeenCalledWith(paths.auth.login);
  });
});

