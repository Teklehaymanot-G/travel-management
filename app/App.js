import { useEffect, useState } from "react";
import { I18nextProvider } from "react-i18next";
import { I18nManager } from "react-native";
import { AuthProvider } from "./src/context/AuthContext";
import i18n from "./src/localization/i18n";
import RootStack from "./src/navigation/RootStack";

export default function App() {
  const [i18nReady, setI18nReady] = useState(false);

  // Initialize i18n and track ready state
  useEffect(() => {
    i18n.init().then(() => {
      setI18nReady(true);
    });
  }, []);

  // RTL layout direction handler
  useEffect(() => {
    if (!i18nReady) return;

    const updateLayoutDirection = () => {
      const isRTL = i18n.language === "am";
      I18nManager.forceRTL(isRTL);
      I18nManager.allowRTL(isRTL);
    };

    // Set initial direction
    updateLayoutDirection();

    // Listen for language changes
    i18n.on("languageChanged", updateLayoutDirection);

    return () => {
      i18n.off("languageChanged", updateLayoutDirection);
    };
  }, [i18nReady]);

  // Wait for i18n initialization
  if (!i18nReady) {
    return null; // Or show a splash screen
  }

  return (
    <I18nextProvider i18n={i18n}>
      <AuthProvider>
        <RootStack />
      </AuthProvider>
    </I18nextProvider>
  );
}
