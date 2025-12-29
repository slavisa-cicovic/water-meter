import { useEffect, useState } from "react";
import { Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { MobileService } from "@src/services/mobile.service";
import { useAuthStore } from "@src/state/auth-store";

export default function TabsLayout() {
  const user = useAuthStore((state) => state.user);
  const [sharedMeter, setSharedMeter] = useState<boolean | null>(null);

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

  const hideReadings = user?.role === "consumer" && sharedMeter === true;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#3a4c7a",
        tabBarInactiveTintColor: "#6b7aa6",
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="readings"
        options={{
          title: "Read meter",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="meter-gas-outline" color={color} size={size} />
          ),
          ...(hideReadings ? { tabBarItemStyle: { display: "none" } } : {}),
        }}
      />
      <Tabs.Screen
        name="payment"
        options={{
          title: "Payment",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="credit-card-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="send-message"
        options={{
          title: "Message",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="message-text-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile-edit"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-circle-outline" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
