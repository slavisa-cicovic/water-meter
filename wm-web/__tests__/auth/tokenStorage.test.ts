import { beforeEach, describe, expect, it } from 'vitest';
import {
  ACCESS_TOKEN_KEY,
  getStoredAccessToken,
  clearStoredAccessToken,
  setStoredAccessToken,
} from 'src/auth/context/jwt/token-storage';

describe('token storage', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('stores token in localStorage when remember is true', () => {
    setStoredAccessToken('t-local', true);

    expect(localStorage.getItem(ACCESS_TOKEN_KEY)).toBe('t-local');
    expect(sessionStorage.getItem(ACCESS_TOKEN_KEY)).toBeNull();
    expect(getStoredAccessToken()).toEqual({ accessToken: 't-local', remember: true });
  });

  it('stores token in sessionStorage when remember is false', () => {
    setStoredAccessToken('t-session', false);

    expect(sessionStorage.getItem(ACCESS_TOKEN_KEY)).toBe('t-session');
    expect(localStorage.getItem(ACCESS_TOKEN_KEY)).toBeNull();
    expect(getStoredAccessToken()).toEqual({ accessToken: 't-session', remember: false });
  });

  it('prefers session token over local token', () => {
    localStorage.setItem(ACCESS_TOKEN_KEY, 't-local');
    sessionStorage.setItem(ACCESS_TOKEN_KEY, 't-session');

    expect(getStoredAccessToken()).toEqual({ accessToken: 't-session', remember: false });
  });

  it('clears both storages', () => {
    setStoredAccessToken('t1', true);
    sessionStorage.setItem(ACCESS_TOKEN_KEY, 't2');

    clearStoredAccessToken();

    expect(localStorage.getItem(ACCESS_TOKEN_KEY)).toBeNull();
    expect(sessionStorage.getItem(ACCESS_TOKEN_KEY)).toBeNull();
  });
});

