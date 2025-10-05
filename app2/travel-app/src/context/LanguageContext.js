import * as Localization from "expo-localization";
import { I18n } from "i18n-js";
import React, { createContext, useContext, useEffect, useState } from "react";
import { am, en } from "../localization/locales";

// Create the context (start undefined so hook can throw when used outside provider)
const LanguageContext = createContext(undefined);

// Initialize i18n-js
const i18n = new I18n({ en, am });
i18n.enableFallback = true;
i18n.defaultLocale = "en";

export const LanguageProvider = ({ children }) => {
  const [currentLocale, setCurrentLocale] = useState("en");

  useEffect(() => {
    // Set initial locale based on device settings
    let deviceLocale = "en";
    try {
      const locales =
        (Localization.getLocales && Localization.getLocales()) || [];
      if (locales.length > 0 && locales[0].languageCode) {
        deviceLocale = locales[0].languageCode;
      }
    } catch (_err) {
      deviceLocale = "en";
    }

    const supportedLocales = ["en", "am"];
    const initialLocale = supportedLocales.includes(deviceLocale)
      ? deviceLocale
      : "en";

    setCurrentLocale(initialLocale);
    i18n.locale = initialLocale;
  }, []);

  const changeLanguage = (locale) => {
    setCurrentLocale(locale);
    i18n.locale = locale;
  };

  const isRTL = currentLocale === "am";

  return (
    <LanguageContext.Provider
      value={{ i18n, currentLocale, changeLanguage, isRTL }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
