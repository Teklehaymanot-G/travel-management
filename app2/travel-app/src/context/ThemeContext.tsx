import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme as rnUseColorScheme } from "react-native";

export type ThemeMode = "light" | "dark" | "system";

interface ThemeContextValue {
  mode: ThemeMode;
  resolvedScheme: "light" | "dark";
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void; // cycles light -> dark -> system -> light
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = "themePreference";

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const systemScheme = (rnUseColorScheme() ?? "light") as "light" | "dark";
  const [mode, setMode] = useState<ThemeMode>("system");
  const resolvedScheme = mode === "system" ? systemScheme : mode;

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored === "light" || stored === "dark" || stored === "system") {
          setMode(stored as ThemeMode);
        }
      } catch {
        // ignore read error
      }
    })();
  }, []);

  const persist = async (value: ThemeMode) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, value);
    } catch {
      // ignore persistence errors
    }
  };

  const updateMode = (value: ThemeMode) => {
    setMode(value);
    persist(value);
  };

  const toggleMode = () => {
    const next: ThemeMode =
      mode === "light" ? "dark" : mode === "dark" ? "system" : "light";
    updateMode(next);
  };

  return (
    <ThemeContext.Provider
      value={{ mode, resolvedScheme, setMode: updateMode, toggleMode }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};
