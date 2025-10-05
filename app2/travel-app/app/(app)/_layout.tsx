import { useLanguage } from "@/src/context/LanguageContext";
import { Stack } from "expo-router";

export default function AppLayout() {
  const { isRTL } = useLanguage();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        gestureDirection: "horizontal",
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="travel-detail/[id]" />
      <Stack.Screen name="booking/[id]" />
    </Stack>
  );
}
