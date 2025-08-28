import OTPInputView from "@twotalltotems/react-native-otp-input";
import { useEffect, useRef, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import AppButton from "../../components/common/AppButton.js";
import theme from "../../config/theme";
import { useAuth } from "../../context/AuthContext";
import { requestOTP } from "../../services/api";

const OTPVerificationScreen = ({ route, navigation }) => {
  const { phone } = route.params;
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(60);
  const [isResending, setIsResending] = useState(false);
  const { login, isLoading } = useAuth();
  const timerRef = useRef(null);

  useEffect(() => {
    if (timer > 0) {
      timerRef.current = setTimeout(() => setTimer(timer - 1), 1000);
    }
    return () => clearTimeout(timerRef.current);
  }, [timer]);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      Alert.alert("Invalid OTP", "Please enter a 6-digit code");
      return;
    }

    const success = await login(phone, otp);
    if (success) {
      navigation.navigate("MainTabs");
    } else {
      Alert.alert("Verification Failed", "The OTP you entered is incorrect");
    }
  };

  const handleResendOTP = async () => {
    if (timer > 0) return;

    setIsResending(true);
    const success = await requestOTP(phone);
    setIsResending(false);

    if (success) {
      setTimer(60);
      Alert.alert("OTP Resent", "A new OTP has been sent to your phone");
    }
  };

  const maskedPhone = phone?.replace(/(\d{3})\d{4}(\d{3})/, "$1****$2");

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify Your Phone</Text>
      <Text style={styles.subtitle}>
        Enter the 6-digit code sent to {maskedPhone}
      </Text>

      <OTPInputView
        style={styles.otpContainer}
        pinCount={6}
        code={otp}
        onCodeChanged={setOtp}
        autoFocusOnLoad
        codeInputFieldStyle={styles.otpInput}
        codeInputHighlightStyle={styles.otpHighlight}
      />

      <AppButton
        title="Verify"
        onPress={handleVerify}
        loading={isLoading}
        disabled={otp.length !== 6}
        style={styles.button}
      />

      <View style={styles.resendContainer}>
        <Text style={styles.resendText}>
          {timer > 0 ? `Resend code in ${timer}s` : "Didn't receive the code?"}
        </Text>
        <TouchableOpacity
          onPress={handleResendOTP}
          disabled={timer > 0 || isResending}
        >
          <Text
            style={[
              styles.resendLink,
              (timer > 0 || isResending) && styles.disabledLink,
            ]}
          >
            Resend OTP
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.m,
    backgroundColor: theme.colors.white,
    justifyContent: "center",
  },
  title: {
    fontSize: theme.fontSize.xxlarge,
    fontWeight: "bold",
    textAlign: "center",
    color: theme.colors.dark,
    marginBottom: theme.spacing.s,
  },
  subtitle: {
    fontSize: theme.fontSize.medium,
    textAlign: "center",
    color: theme.colors.gray,
    marginBottom: theme.spacing.xl,
  },
  otpContainer: {
    width: "80%",
    height: 100,
    alignSelf: "center",
  },
  otpInput: {
    width: 45,
    height: 60,
    borderWidth: 1,
    borderColor: theme.colors.gray,
    borderRadius: theme.borderRadius.small,
    color: theme.colors.dark,
    fontSize: theme.fontSize.xlarge,
  },
  otpHighlight: {
    borderColor: theme.colors.primary,
  },
  button: {
    marginTop: theme.spacing.l,
  },
  resendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: theme.spacing.xl,
  },
  resendText: {
    fontSize: theme.fontSize.medium,
    color: theme.colors.gray,
  },
  resendLink: {
    fontSize: theme.fontSize.medium,
    color: theme.colors.primary,
    fontWeight: "bold",
    marginLeft: theme.spacing.s,
  },
  disabledLink: {
    opacity: 0.5,
  },
});

export default OTPVerificationScreen;
