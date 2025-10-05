import OTPVerificationScreen from "@/src/screens/auth/OTPVerificationScreen";
import { useLocalSearchParams, useNavigation } from "expo-router";
import React from "react";

export default function OTPVerification() {
  const navigation = useNavigation();
  const { phone } = useLocalSearchParams();
  console.log("otp");
  // Provide a route object with params to keep compatibility with screens
  const route = { params: { phone } };

  return <OTPVerificationScreen route={route} navigation={navigation} />;
}
