import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

import { apiClient } from "@src/api/client";
import { LoginUser } from "@src/api/types/auth";

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

const applyToken = (token: string | null) => {
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
    return;
  }

  delete apiClient.defaults.headers.common.Authorization;
};

const parseUser = (value: string | null): LoginUser | null => {
  if (!value) return null;
  try {
    return JSON.parse(value) as LoginUser;
  } catch {
    return null;
  }
};

type AuthState = {
  hydrated: boolean;
  accessToken: string | null;
  user: LoginUser | null;
  hydrate: () => Promise<void>;
  setSession: (accessToken: string, user?: LoginUser | null) => Promise<void>;
  clearSession: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  hydrated: false,
  accessToken: null,
  user: null,
  hydrate: async () => {
    try {
      const [token, rawUser] = await Promise.all([
        AsyncStorage.getItem(TOKEN_KEY),
        AsyncStorage.getItem(USER_KEY),
      ]);
      applyToken(token);
      set({ accessToken: token, user: parseUser(rawUser), hydrated: true });
    } catch {
      set({ hydrated: true });
    }
  },
  setSession: async (accessToken, user = null) => {
    applyToken(accessToken);
    set({ accessToken, user });
    try {
      await AsyncStorage.setItem(TOKEN_KEY, accessToken);
      if (user) {
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
      } else {
        await AsyncStorage.removeItem(USER_KEY);
      }
    } catch {
      // Storage failures should not block login flow.
    }
  },
  clearSession: async () => {
    applyToken(null);
    set({ accessToken: null, user: null });
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
      await AsyncStorage.removeItem(USER_KEY);
    } catch {
      // Storage failures should not block logout flow.
    }
  },
}));
