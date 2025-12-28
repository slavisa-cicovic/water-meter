import { Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function TabsLayout() {
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
