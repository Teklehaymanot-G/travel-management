import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { Alert } from "react-native";

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

      // Simulate API call to request OTP
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock success response
      return true;
    } catch (error) {
      console.error("OTP request failed:", error);
      Alert.alert("Error", "Failed to send OTP. Please try again.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // In your AuthContext
  const verifyOTP = async (phone, otp) => {
    try {
      // setLoadingAction("verifying");

      // Simulate API call to verify OTP
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock verification
      if (otp === "123456") {
        const userData = {
          id: "1",
          phone,
          name: "Travel User",
          email: "user@example.com",
        };

        setUser(userData);
        setIsAuthenticated(true);

        // Store auth data
        await AsyncStorage.setItem("userToken", "mock-jwt-token");
        await AsyncStorage.setItem("userData", JSON.stringify(userData));

        return true;
      } else {
        Alert.alert(
          "Invalid OTP",
          "Please enter the correct verification code."
        );
        return false;
      }
    } catch (error) {
      console.error("OTP verification failed:", error);
      Alert.alert("Error", "Failed to verify OTP. Please try again.");
      return false;
    } finally {
      // setLoadingAction(null);
    }
  };

  const resendOTP = async (phone) => {
    try {
      setIsLoading(true);

      // Simulate API call to resend OTP
      await new Promise((resolve) => setTimeout(resolve, 1500));

      console.log("OTP resent to:", phone);
      return true;
    } catch (error) {
      console.error("Resend OTP failed:", error);
      Alert.alert("Error", "Failed to resend OTP. Please try again.");
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
