import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { I18nextProvider } from "react-i18next";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import LoadingIndicator from "@/src/components/common/LoadingIndicator";
import { AuthProvider, useAuth } from "@/src/context/AuthContext";
import { LanguageProvider } from "@/src/context/LanguageContext";
import i18n from "@/src/localization/i18n";

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { isAuthenticated, isLoading, loadingAction } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inAppGroup = segments[0] === "(app)";

    if (isAuthenticated && inAuthGroup) {
      router.replace("/(app)/(tabs)");
    } else if (!isAuthenticated && inAppGroup) {
      router.replace("/(auth)/login");
    }
  }, [isAuthenticated, isLoading, segments]);

  if (isLoading && loadingAction === "checking") {
    return (
      <LoadingIndicator
        fullScreen
        text="Checking authentication..."
        type="rotate"
      />
    );
  }

  if (loadingAction) {
    const loadingTexts = {
      verifying: "Verifying your code...",
      requesting_otp: "Sending verification code...",
      resending: "Resending code...",
      logout: "Signing out...",
    };

    const getLoadingText = (action: string): string => {
      return loadingTexts[action as keyof typeof loadingTexts] || "Loading...";
    };

    return (
      <LoadingIndicator
        fullScreen
        text={getLoadingText(loadingAction)}
        type="pulse"
      />
    );
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
        <Stack.Screen
          name="modal"
          options={{
            presentation: "modal",
            title: "Modal",
            headerShown: false,
          }}
        />
      </Stack>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <I18nextProvider i18n={i18n}>
      <AuthProvider>
        <LanguageProvider>
          <RootLayoutNav />
        </LanguageProvider>
      </AuthProvider>
    </I18nextProvider>
  );
}
