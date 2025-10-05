import { useLanguage } from "@/src/context/LanguageContext";
import { Stack } from "expo-router";

export default function AuthLayout() {
  const { isRTL } = useLanguage();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        gestureDirection: "horizontal",
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="otp-verification" />
    </Stack>
  );
}
