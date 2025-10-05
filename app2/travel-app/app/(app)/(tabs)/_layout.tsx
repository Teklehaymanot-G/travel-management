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
        tabBarActiveTintColor: "#667eea",
        tabBarInactiveTintColor: "#a0aec0",
        tabBarStyle: {
          backgroundColor: colorScheme === "dark" ? "#1a202c" : "#ffffff",
          borderTopColor: colorScheme === "dark" ? "#2d3748" : "#e2e8f0",
        },
        headerStyle: {
          backgroundColor: colorScheme === "dark" ? "#1a202c" : "#ffffff",
        },
        headerTintColor: colorScheme === "dark" ? "#ffffff" : "#1a202c",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("discover"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="compass" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="my-tickets"
        options={{
          title: t("my_tickets"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="ticket" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t("profile"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
