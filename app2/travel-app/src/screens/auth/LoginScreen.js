import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
// using react-navigation via `navigation` prop provided by RootStack
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import PhoneInput from "../../components/auth/PhoneInput";
import AppButton from "../../components/common/AppButton";
import { useAuth } from "../../context/AuthContext";

const { width, height } = Dimensions.get("window");

const LoginScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const { requestOTP, isLoading } = useAuth();
  const [phone, setPhone] = useState("");
  const [isValid, setIsValid] = useState(false);
  const router = useRouter(); // Add Expo Router

  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handleContinue = async () => {
    if (!isValid) {
      Alert.alert(t("invalid_phone"), t("please_enter_valid_phone"), [
        { text: t("ok") },
      ]);
      return;
    }
    const success = await requestOTP(phone);
    if (success) {
      router.push({
        pathname: "/(auth)/otp-verification",
        params: { phone },
      });
    } else {
      Alert.alert(t("error"), t("failed_to_send_otp"), [{ text: t("ok") }]);
    }
  };

  const toggleLanguage = () => {
    const newLanguage = i18n.language === "en" ? "am" : "en";
    i18n.changeLanguage(newLanguage);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <LinearGradient
        colors={["#4F46E5", "#7C3AED"]}
        style={styles.background}
      />

      {/* Background Pattern */}
      <View style={styles.patternContainer}>
        <Image
          source={require("../../assets/images/pattern.png")}
          style={styles.pattern}
          blurRadius={5}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.languageButton}
            onPress={toggleLanguage}
          >
            <Text style={styles.languageText}>
              {i18n.language === "en" ? "አማ" : "EN"}
            </Text>
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
          {/* Logo and Welcome Section */}
          <View style={styles.welcomeSection}>
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={["#ffffff", "#f8f9fa"]}
                style={styles.logoBackground}
              >
                <MaterialCommunityIcons name="bus" size={44} color="#4F46E5" />
              </LinearGradient>
            </View>

            <Text style={styles.title}>{t("welcome_to_travelbus")}</Text>
            <Text style={styles.subtitle}>{t("sign_in_with_phone")}</Text>
          </View>

          {/* Phone Input Section */}
          <View style={styles.inputSection}>
            <View style={styles.inputHeader}>
              <MaterialCommunityIcons name="phone" size={20} color="#4F46E5" />
              <Text style={styles.inputLabel}>{t("phone_number")}</Text>
            </View>

            <PhoneInput
              value={phone}
              onChangeText={setPhone}
              onValidationChange={setIsValid}
              style={styles.phoneInput}
            />

            <Text style={styles.helperText}>{t("we_will_send_otp")}</Text>
          </View>

          {/* Continue Button */}
          <AppButton
            title={t("send_verification_code")}
            onPress={handleContinue}
            disabled={!isValid || isLoading}
            loading={isLoading}
            style={styles.continueButton}
            gradient={["#4F46E5", "#7C3AED"]}
            icon="arrow-forward"
          />

          {/* Features Section */}
          <View style={styles.featuresSection}>
            <View style={styles.featureItem}>
              <MaterialCommunityIcons
                name="shield-check"
                size={24}
                color="#10B981"
              />
              <Text style={styles.featureText}>{t("secure_verification")}</Text>
            </View>
            <View style={styles.featureItem}>
              <MaterialCommunityIcons
                name="clock-fast"
                size={24}
                color="#3B82F6"
              />
              <Text style={styles.featureText}>{t("instant_otp")}</Text>
            </View>
            <View style={styles.featureItem}>
              <MaterialCommunityIcons
                name="account-group"
                size={24}
                color="#8B5CF6"
              />
              <Text style={styles.featureText}>{t("easy_booking")}</Text>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {t("by_continuing_you_agree")}
            </Text>
            <View style={styles.termsContainer}>
              <TouchableOpacity>
                <Text style={styles.termsLink}>{t("terms_of_service")}</Text>
              </TouchableOpacity>
              <Text style={styles.footerText}> {t("and")} </Text>
              <TouchableOpacity>
                <Text style={styles.termsLink}>{t("privacy_policy")}</Text>
              </TouchableOpacity>
            </View>

            {/* Support Info */}
            <View style={styles.supportSection}>
              <MaterialCommunityIcons
                name="headset"
                size={16}
                color="#6B7280"
              />
              <Text style={styles.supportText}>
                {t("need_help")}
                <Text style={styles.supportLink}> {t("contact_support")}</Text>
              </Text>
            </View>
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
    height: height * 0.5,
  },
  patternContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
  },
  pattern: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: 20,
    alignItems: "flex-end",
  },
  languageButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  languageText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 14,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    marginTop: 40,
  },
  welcomeSection: {
    alignItems: "center",
    marginBottom: 48,
  },
  logoContainer: {
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
  logoBackground: {
    width: 88,
    height: 88,
    borderRadius: 44,
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
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    lineHeight: 22,
    fontWeight: "500",
  },
  inputSection: {
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
  inputHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2d3748",
    marginLeft: 8,
  },
  phoneInput: {
    marginBottom: 12,
  },
  helperText: {
    fontSize: 14,
    color: "#718096",
    marginTop: 8,
    textAlign: "center",
  },
  continueButton: {
    marginBottom: 32,
    shadowColor: "#4F46E5",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  featuresSection: {
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 12,
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
    marginLeft: 12,
  },
  footer: {
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    lineHeight: 16,
  },
  termsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 4,
    marginBottom: 16,
  },
  termsLink: {
    fontSize: 12,
    color: "#ffffff",
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  supportSection: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  supportText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    marginLeft: 8,
  },
  supportLink: {
    color: "#ffffff",
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});

export default LoginScreen;
