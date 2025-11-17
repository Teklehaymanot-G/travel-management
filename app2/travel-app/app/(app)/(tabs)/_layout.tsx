import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useTranslation } from "react-i18next";

export default function TabLayout() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#4f46e5",
        tabBarInactiveTintColor: "#94a3b8",
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginBottom: 2,
        },
        tabBarStyle: {
          backgroundColor: colorScheme === "dark" ? "#0f172a" : "#ffffff",
          borderTopColor: colorScheme === "dark" ? "#1e293b" : "#e2e8f0",
          elevation: 12,
          shadowColor: "#000",
          shadowOpacity: 0.08,
          shadowRadius: 6,
          height: 64,
          paddingBottom: 8,
        },
        headerStyle: {
          backgroundColor: colorScheme === "dark" ? "#0f172a" : "#ffffff",
        },
        headerTintColor: colorScheme === "dark" ? "#ffffff" : "#0f172a",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("home") || t("discover_short") || "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="my-bookings"
        options={{
          title: t("my_bookings") || t("bookings") || "Bookings",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="my-tickets"
        options={{
          title: t("my_tickets") || "My Tickets",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="ticket" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t("profile") || "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="witness"
        options={{
          title: t("witness") || "Witness",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="megaphone" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
