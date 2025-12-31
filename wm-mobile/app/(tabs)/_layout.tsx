import { useEffect, useState } from "react";
import { Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { AppState, TouchableOpacity } from "react-native";
import { MobileService } from "@src/services/mobile.service";
import { useAuthStore } from "@src/state/auth-store";
import { useNotificationsStore } from "@src/state/notifications-store";

const resolveHandler = <T extends ((...args: any[]) => void) | null | undefined>(
  handler: T
): Exclude<T, null> | undefined => (handler ?? undefined) as Exclude<T, null> | undefined;

export default function TabsLayout() {
  const user = useAuthStore((state) => state.user);
  const [sharedMeter, setSharedMeter] = useState<boolean | null>(null);
  const hasIssuedInvoice = useNotificationsStore((state) => state.hasIssuedInvoice);
  const refreshNotifications = useNotificationsStore((state) => state.refreshNotifications);
  const setHasIssuedInvoice = useNotificationsStore((state) => state.setHasIssuedInvoice);

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

  const hideReadings = user?.role === "consumer" && sharedMeter === true;
  const paymentEnabled = user?.role === "consumer" ? hasIssuedInvoice : false;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#3a4c7a",
        tabBarInactiveTintColor: "#6b7aa6",
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
        tabBarStyle: {
          borderTopColor: "#e1e6f3",
          borderTopWidth: 1,
          backgroundColor: "#ffffff",
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
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
          title: "Read meter",
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
          title: "Payment",
          tabBarIcon: ({ focused, size }) => (
            <MaterialCommunityIcons
              name="credit-card-outline"
              color={focused ? "#3a4c7a" : "#6b7aa6"}
              size={size}
            />
          ),
          tabBarBadge: paymentEnabled ? "1" : undefined,
          tabBarButton: (props) => {
            const {
              onPress,
              onLongPress,
              onPressIn,
              onPressOut,
              onFocus,
              onBlur,
              accessibilityLabel,
              accessibilityState,
              testID,
              style,
              children,
            } = props;
            return (
              <TouchableOpacity
                onPress={resolveHandler(onPress)}
                onLongPress={resolveHandler(onLongPress)}
                onPressIn={resolveHandler(onPressIn)}
                onPressOut={resolveHandler(onPressOut)}
                onFocus={resolveHandler(onFocus)}
                onBlur={resolveHandler(onBlur)}
                accessibilityLabel={accessibilityLabel}
                accessibilityState={accessibilityState}
                testID={testID}
                disabled={!paymentEnabled}
                style={[style, !paymentEnabled ? { opacity: 0.4 } : null]}
              >
                {children}
              </TouchableOpacity>
            );
          },
        }}
      />
      <Tabs.Screen
        name="send-message"
        options={{
          title: "Message",
          tabBarIcon: ({ focused, size }) => (
            <MaterialCommunityIcons
              name="message-text-outline"
              color={focused ? "#3a4c7a" : "#6b7aa6"}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile-edit"
        options={{
          title: "Profile",
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
