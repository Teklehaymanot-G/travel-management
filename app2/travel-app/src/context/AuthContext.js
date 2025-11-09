import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { Alert } from "react-native";
import { API_URL } from "../utils/constants";

function makeFetch(url, options = {}, { timeoutMs = 10000 } = {}) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...options, signal: controller.signal }).finally(() =>
    clearTimeout(id)
  );
}

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for existing authentication on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem("userToken");
      const userData = await AsyncStorage.getItem("userData");

      if (token && userData) {
        setUser(JSON.parse(userData));
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const requestOTP = async (phone) => {
    try {
      setIsLoading(true);
      const res = await makeFetch(`${API_URL}/auth/register/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to send OTP");
      }
      const data = await res.json();
      // Optionally log devCode during development
      if (data.devCode) console.log("DEV OTP:", data.devCode);
      return true;
    } catch (error) {
      console.error("OTP request failed:", error);
      const hint = API_URL.includes("localhost")
        ? " (Set EXPO_PUBLIC_API_URL to http://<LAN_IP>:5000/api)"
        : "";
      const msg =
        error.name === "AbortError"
          ? "Request timed out. Check network/Wi‑Fi."
          : error.message || "Failed to send OTP.";
      Alert.alert("Network Error", msg + hint);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // In your AuthContext
  const verifyOTP = async (phone, otp, options = {}) => {
    try {
      setIsLoading(true);
      const res = await makeFetch(`${API_URL}/auth/register/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code: otp, name: options.name }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Invalid OTP");
      }
      const data = await res.json();
      const { token, user } = data;
      setUser(user);
      setIsAuthenticated(true);
      await AsyncStorage.setItem("userToken", token);
      await AsyncStorage.setItem("userData", JSON.stringify(user));
      return true;
    } catch (error) {
      console.error("OTP verification failed:", error);
      const msg =
        error.name === "AbortError"
          ? "Request timed out. Check network/Wi‑Fi."
          : error.message || "Failed to verify OTP.";
      Alert.alert("Network Error", msg);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const resendOTP = async (phone) => {
    try {
      setIsLoading(true);
      const res = await makeFetch(`${API_URL}/auth/register/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to resend OTP");
      }
      return true;
    } catch (error) {
      console.error("Resend OTP failed:", error);
      const msg =
        error.name === "AbortError"
          ? "Request timed out. Check network/Wi‑Fi."
          : error.message || "Failed to resend OTP.";
      Alert.alert("Network Error", msg);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);

      // Clear stored data
      await AsyncStorage.multiRemove(["userToken", "userData"]);

      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    requestOTP,
    verifyOTP,
    resendOTP,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
