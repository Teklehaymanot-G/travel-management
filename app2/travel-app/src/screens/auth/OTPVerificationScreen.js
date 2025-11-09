import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import OTPInput from "../../components/auth/OTPInput";
import AppButton from "../../components/common/AppButton";
import { useAuth } from "../../context/AuthContext";

const OTPVerificationScreen = ({ route, navigation }) => {
  const { t } = useTranslation();
  const { verifyOTP, resendOTP, isLoading } = useAuth();
  const { phone, name } = route.params;
  const router = useRouter();

  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    startTimer();
  }, [fadeAnim, slideAnim]);

  useEffect(() => {
    let interval;
    if (timer > 0 && !canResend) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0 && !canResend) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer, canResend]);

  const startTimer = () => {
    setTimer(60);
    setCanResend(false);
  };

  const handleVerify = async () => {
    if (otp.length !== 6) {
      Alert.alert(t("invalid_otp"), t("please_enter_6_digit_otp"), [
        { text: t("ok") },
      ]);
      return;
    }

  const success = await verifyOTP(phone, otp, { name });
    if (success) {
      // Navigate to the main app with tabs using Expo Router
      router.replace("/(app)/(tabs)");
    } else {
      Alert.alert(t("error"), t("invalid_otp_please_try_again"), [
        { text: t("ok") },
      ]);
    }
  };

  const handleResendOTP = async () => {
    const success = await resendOTP(phone);
    if (success) {
      startTimer();
      Alert.alert(t("otp_resent"), t("new_otp_sent_successfully"), [
        { text: t("ok") },
      ]);
    } else {
      Alert.alert(t("error"), t("failed_to_resend_otp"), [{ text: t("ok") }]);
    }
  };

  const handleGoBack = () => {
    // Use Expo Router for going back
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(auth)/login");
    }
  };

  const maskedPhone = phone ? `${phone.slice(0, 6)}****${phone.slice(-2)}` : "";

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <LinearGradient
        colors={["#667eea", "#764ba2"]}
        style={styles.background}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Verification Section */}
          <View style={styles.verificationSection}>
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={["#ffffff", "#f8f9fa"]}
                style={styles.iconBackground}
              >
                <Ionicons name="lock-closed" size={32} color="#667eea" />
              </LinearGradient>
            </View>

            <Text style={styles.title}>{t("verify_your_phone")}</Text>
            <Text style={styles.subtitle}>
              {t("enter_verification_code_sent_to")} {maskedPhone}
            </Text>
          </View>

          {/* OTP Input Section */}
          <View style={styles.otpSection}>
            <OTPInput
              length={6}
              value={otp}
              onChange={setOtp}
              autoFocus={true}
            />

            <View style={styles.resendContainer}>
              <Text style={styles.resendText}>{t("didnt_receive_code")}</Text>
              <TouchableOpacity
                onPress={handleResendOTP}
                disabled={!canResend || isLoading}
              >
                <Text
                  style={[
                    styles.resendButton,
                    canResend && styles.resendButtonActive,
                    (isLoading || !canResend) && styles.resendButtonDisabled,
                  ]}
                >
                  {canResend ? t("resend_otp") : `${t("resend_in")} ${timer}s`}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Verify Button */}
          <AppButton
            title={t("verify")}
            onPress={handleVerify}
            disabled={otp.length !== 6 || isLoading}
            loading={isLoading}
            style={styles.verifyButton}
            gradient={["#667eea", "#764ba2"]}
            icon="checkmark"
          />

          {/* Help Section */}
          <View style={styles.helpSection}>
            <Text style={styles.helpTitle}>{t("having_trouble")}</Text>
            <Text style={styles.helpText}>{t("check_your_network")}</Text>
            <Text style={styles.helpText}>{t("make_sure_correct_number")}</Text>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    marginTop: 20,
  },
  verificationSection: {
    alignItems: "center",
    marginBottom: 40,
  },
  iconContainer: {
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  iconBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 8,
    textShadowColor: "rgba(0, 0, 0, 0.1)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    lineHeight: 22,
  },
  otpSection: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  resendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    flexWrap: "wrap",
  },
  resendText: {
    fontSize: 14,
    color: "#718096",
    marginRight: 8,
  },
  resendButton: {
    fontSize: 14,
    fontWeight: "600",
  },
  resendButtonActive: {
    color: "#667eea",
  },
  resendButtonDisabled: {
    color: "#a0aec0",
  },
  verifyButton: {
    marginBottom: 24,
    shadowColor: "#667eea",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  helpSection: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 4,
  },
});

export default OTPVerificationScreen;
