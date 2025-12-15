import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockAxios = {
  defaults: { headers: { common: {} as Record<string, string> } },
  get: vi.fn(),
  post: vi.fn(),
};

vi.mock('src/utils/axios', () => ({
  default: mockAxios,
  endpoints: {
    auth: {
      me: '/api/auth/me',
      login: '/api/auth/login',
      register: '/api/auth/register',
      forgotPassword: '/api/auth/forgot-password',
    },
  },
}));

function createToken(expSeconds: number) {
  const payload = { exp: expSeconds };
  const base64 = Buffer.from(JSON.stringify(payload))
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  return `h.${base64}.s`;
}

describe('AuthProvider initialization', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    mockAxios.defaults.headers.common = {};
    mockAxios.get.mockResolvedValue({ data: { user: { id: 'u1' } } });
  });

  it('uses sessionStorage token when present', async () => {
    const tokenLocal = createToken(Math.floor(Date.now() / 1000) + 3600);
    const tokenSession = createToken(Math.floor(Date.now() / 1000) + 7200);

    localStorage.setItem('accessToken', tokenLocal);
    sessionStorage.setItem('accessToken', tokenSession);

    const { AuthProvider, AuthContext } = await import('src/auth/context/jwt');

    function Probe() {
      const ctx = React.useContext(AuthContext);
      return <div>{ctx.user ? ctx.user.id : 'none'}</div>;
    }

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByText('u1')).toBeInTheDocument());
    expect(mockAxios.defaults.headers.common.Authorization).toBe(`Bearer ${tokenSession}`);
  });

  it('falls back to localStorage token when session token is missing', async () => {
    const tokenLocal = createToken(Math.floor(Date.now() / 1000) + 3600);

    localStorage.setItem('accessToken', tokenLocal);

    const { AuthProvider, AuthContext } = await import('src/auth/context/jwt');

    function Probe() {
      const ctx = React.useContext(AuthContext);
      return <div>{ctx.user ? ctx.user.id : 'none'}</div>;
    }

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByText('u1')).toBeInTheDocument());
    expect(mockAxios.defaults.headers.common.Authorization).toBe(`Bearer ${tokenLocal}`);
  });
});

