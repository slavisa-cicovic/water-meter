import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import "react-native-reanimated";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { useColorScheme } from "@src/hooks/use-color-scheme";
import { useAuthStore } from "@src/state/auth-store";
import { useLocaleStore } from "@src/state/locale-store";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();

  const hydrate = useAuthStore(state => state.hydrate);
  const hydrated = useAuthStore(state => state.hydrated);
  const accessToken = useAuthStore(state => state.accessToken);
  const hydrateLocale = useLocaleStore(state => state.hydrate);
  const localeHydrated = useLocaleStore(state => state.hydrated);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    hydrateLocale();
  }, [hydrateLocale]);

  useEffect(() => {
    if (!hydrated || !localeHydrated) return;

    const inAuthRoute =
      segments[0] === "login" || segments[0] === "register" || segments[0] === "forgot-password";

    if (!accessToken && !inAuthRoute) {
      router.replace("/login");
    } else if (accessToken && inAuthRoute) {
      router.replace("/home");
    }
  }, [accessToken, hydrated, router, segments]);

  const theme = colorScheme === "dark" ? DarkTheme : DefaultTheme;

  const ready = hydrated && localeHydrated;

  return (
    <ThemeProvider value={theme}>
      {!ready ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator />
        </View>
      ) : (
        <GestureHandlerRootView style={{ flex: 1 }}>
          <Stack>
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="register" options={{ headerShown: false }} />
            <Stack.Screen name="forgot-password" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="modal"
              options={{ presentation: "modal", title: "Modal" }}
            />
          </Stack>
          <StatusBar style="auto" />
        </GestureHandlerRootView>
      )}
    </ThemeProvider>
  );
}
