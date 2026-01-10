import { useEffect, useMemo, useState } from "react";
import { Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { AppState } from "react-native";
import { MobileService } from "@src/services/mobile.service";
import { useAuthStore } from "@src/state/auth-store";
import { useNotificationsStore } from "@src/state/notifications-store";
import { useMessagesStore } from "@src/state/messages-store";
import { useTranslation } from "@src/hooks/use-translation";

export default function TabsLayout() {
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const [sharedMeter, setSharedMeter] = useState<boolean | null>(null);
  const hasIssuedInvoice = useNotificationsStore((state) => state.hasIssuedInvoice);
  const refreshNotifications = useNotificationsStore((state) => state.refreshNotifications);
  const setHasIssuedInvoice = useNotificationsStore((state) => state.setHasIssuedInvoice);
  const unreadMessages = useMessagesStore((state) => state.unreadCount);
  const refreshMessages = useMessagesStore((state) => state.refreshMessages);
  const { t } = useTranslation();

  useEffect(() => {
    let active = true;
    if (user?.role !== "consumer") {
      setSharedMeter(null);
      return () => {
        active = false;
      };
    }

    const loadMeter = async () => {
      const result = await MobileService.getAccount();
      if (!active) return;
      if (result.success) {
        setSharedMeter(result.data.meter?.shared ?? false);
        return;
      }
      setSharedMeter(null);
    };

    loadMeter();
    return () => {
      active = false;
    };
  }, [user?.role]);

  useEffect(() => {
    let active = true;
    if (!user) {
      setHasIssuedInvoice(false);
      return () => {
        active = false;
      };
    }

    const refresh = async () => {
      await refreshNotifications();
    };

    refresh();

    const interval = setInterval(() => {
      if (active) {
        refresh();
      }
    }, 5 * 60 * 1000);
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        refresh();
      }
    });

    return () => {
      active = false;
      clearInterval(interval);
      subscription.remove();
    };
  }, [refreshNotifications, setHasIssuedInvoice, user?.id]);

  useEffect(() => {
    let active = true;
    if (!user) {
      return () => {
        active = false;
      };
    }

    const refresh = async () => {
      await refreshMessages();
    };

    refresh();

    const interval = setInterval(() => {
      if (active) {
        refresh();
      }
    }, 30000);
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        refresh();
      }
    });

    return () => {
      active = false;
      clearInterval(interval);
      subscription.remove();
    };
  }, [refreshMessages, user?.id]);

  const tabBarStyle = useMemo(
    () => ({
      borderTopColor: "#e1e6f3",
      borderTopWidth: 1,
      backgroundColor: "#ffffff",
    }),
    []
  );

  const hideReadings = user?.role === "consumer" && sharedMeter === true;
  const paymentEnabled = user?.role === "consumer" ? hasIssuedInvoice : false;

  if (!accessToken) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#3a4c7a",
        tabBarInactiveTintColor: "#6b7aa6",
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
        tabBarHideOnKeyboard: false,
        tabBarStyle,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: t("tabs.home"),
          tabBarIcon: ({ focused, size }) => (
            <MaterialCommunityIcons
              name="home-outline"
              color={focused ? "#3a4c7a" : "#6b7aa6"}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="readings"
        options={{
          title: t("tabs.readings"),
          tabBarIcon: ({ focused, size }) => (
            <MaterialCommunityIcons
              name="meter-gas-outline"
              color={focused ? "#3a4c7a" : "#6b7aa6"}
              size={size}
            />
          ),
          ...(hideReadings ? { tabBarItemStyle: { display: "none" } } : {}),
        }}
      />
      <Tabs.Screen
        name="payment"
        options={{
          title: t("tabs.payment"),
          tabBarIcon: ({ focused, size }) => (
            <MaterialCommunityIcons
              name="credit-card-outline"
              color={focused ? "#3a4c7a" : "#6b7aa6"}
              size={size}
            />
          ),
          tabBarBadge: paymentEnabled ? "1" : undefined,
          tabBarItemStyle: !paymentEnabled ? { opacity: 0.4 } : undefined,
        }}
        listeners={{
          tabPress: (event) => {
            if (!paymentEnabled) {
              event.preventDefault();
            }
          },
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: t("tabs.message"),
          tabBarIcon: ({ focused, size }) => (
            <MaterialCommunityIcons
              name="message-text-outline"
              color={focused ? "#3a4c7a" : "#6b7aa6"}
              size={size}
            />
          ),
          tabBarBadge: unreadMessages > 99 ? "99+" : unreadMessages ? String(unreadMessages) : undefined,
        }}
      />
      <Tabs.Screen
        name="profile-edit"
        options={{
          title: t("tabs.profile"),
          tabBarIcon: ({ focused, size }) => (
            <MaterialCommunityIcons
              name="account-circle-outline"
              color={focused ? "#3a4c7a" : "#6b7aa6"}
              size={size}
            />
          ),
        }}
      />
    </Tabs>
  );
}
