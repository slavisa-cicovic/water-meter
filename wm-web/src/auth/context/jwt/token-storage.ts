export const ACCESS_TOKEN_KEY = 'accessToken';
export const REMEMBER_ME_KEY = 'rememberMe';

export type StoredAccessToken = {
  accessToken: string | null;
  remember: boolean;
};

export function getStoredAccessToken(): StoredAccessToken {
  const sessionToken = sessionStorage.getItem(ACCESS_TOKEN_KEY);
  if (sessionToken) {
    return { accessToken: sessionToken, remember: false };
  }

  const localToken = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (localToken) {
    return { accessToken: localToken, remember: true };
  }

  return { accessToken: null, remember: false };
}

export function setStoredAccessToken(accessToken: string, remember: boolean) {
  if (remember) {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REMEMBER_ME_KEY, '1');
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(REMEMBER_ME_KEY);
    return;
  }

  sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  sessionStorage.setItem(REMEMBER_ME_KEY, '0');
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REMEMBER_ME_KEY);
}

export function clearStoredAccessToken() {
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(REMEMBER_ME_KEY);
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REMEMBER_ME_KEY);
}

