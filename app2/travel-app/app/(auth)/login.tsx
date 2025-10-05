import LoginScreen from "@/src/screens/auth/LoginScreen";
import { useNavigation } from "expo-router";
import React from "react";

export default function Login() {
  const navigation = useNavigation();
  return <LoginScreen navigation={navigation} />;
}
