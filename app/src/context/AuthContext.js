import { createContext, useContext, useState } from "react";
import { LanguageProvider } from "./LanguageContext";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (phone, otp) => {
    setIsLoading(true);
    // Mock login - in real app, call API
    return new Promise((resolve) => {
      setTimeout(() => {
        setUser({
          id: "1",
          name: "John Traveler",
          phone,
          role: "TRAVELER",
        });
        setIsLoading(false);
        resolve(true);
      }, 1500);
    });
  };

  const requestOTP = async (phone) => {
    setIsLoading(true);
    // Mock OTP request
    return new Promise((resolve) => {
      setTimeout(() => {
        setIsLoading(false);
        resolve(true);
      }, 1000);
    });
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <LanguageProvider>
      <AuthContext.Provider
        value={{
          user,
          isLoading,
          login,
          logout,
          requestOTP,
          isAuthenticated: !!user,
        }}
      >
        {children}
      </AuthContext.Provider>
    </LanguageProvider>
  );
};

export const useAuth = () => useContext(AuthContext);
