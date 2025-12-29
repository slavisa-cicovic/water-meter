import { useEffect, useState } from "react";
import { Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";
import { MobileService } from "@src/services/mobile.service";
import { useAuthStore } from "@src/state/auth-store";

export default function TabsLayout() {
  const user = useAuthStore((state) => state.user);
  const [sharedMeter, setSharedMeter] = useState<boolean | null>(null);
  const [hasIssuedInvoice, setHasIssuedInvoice] = useState(false);

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

    const loadPayment = async () => {
      const result = await MobileService.getPayment();
      if (!active) return;
      if (result.success && result.data.invoice) {
        setHasIssuedInvoice(true);
        return;
      }
      setHasIssuedInvoice(false);
    };

    loadPayment();
    return () => {
      active = false;
    };
  }, [user?.id]);

  const hideReadings = user?.role === "consumer" && sharedMeter === true;
  const paymentEnabled = user?.role === "consumer" ? hasIssuedInvoice : true;

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
          tabBarBadge: paymentEnabled ? "1" : undefined,
          tabBarButton: (props) => (
            <TouchableOpacity
              {...props}
              disabled={!paymentEnabled}
              style={[props.style, !paymentEnabled ? { opacity: 0.4 } : null]}
            />
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
