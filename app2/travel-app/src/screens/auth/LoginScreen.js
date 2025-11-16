import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Colors } from "../../../constants/theme";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  TextInput,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import PhoneInput from "../../components/auth/PhoneInput";
import { useAuth } from "../../context/AuthContext";

const { height } = Dimensions.get("window");

const LoginScreen = () => {
  const { t, i18n } = useTranslation();
  const { loginWithPin, isLoading } = useAuth();
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [isValid, setIsValid] = useState(false);
  const router = useRouter();
  // Dark mode removed; use light palette only.
  const C = Colors.light;

  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
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
    if (!pin || pin.length < 4) {
      Alert.alert(t("invalid_pin"), t("please_enter_valid_pin"), [
        { text: t("ok") },
      ]);
      return;
    }
    const success = await loginWithPin(phone, pin);
    if (success) router.replace("/(app)/(tabs)");
    else Alert.alert(t("error"), t("invalid_credentials"), [{ text: t("ok") }]);
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
        colors={[C.brandStart, C.brandEnd]}
        style={styles.background}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.languageButton}
            onPress={toggleLanguage}
          >
            <Text style={styles.languageText}>
              {i18n.language === "en" ? "አማ" : "EN"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerRegisterBtn}
            onPress={() => router.push("/(auth)/register")}
          >
            <Text style={styles.headerRegisterText}>{t("create_account")}</Text>
          </TouchableOpacity>
        </View>

        <Animated.View
          style={[
            styles.content,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.welcomeSection}>
            <Text style={styles.title}>{t("welcome_to_travelbus")}</Text>
            <Text style={styles.subtitle}>{t("sign_in_with_pin")}</Text>
          </View>

          <View
            style={[
              styles.inputSection,
              { backgroundColor: C.background, shadowColor: C.brandAccent },
            ]}
          >
            <View style={styles.inputHeader}>
              <MaterialCommunityIcons
                name="phone"
                size={20}
                color={C.brandAccent}
              />
              <Text style={styles.inputLabel}>{t("phone_number")}</Text>
            </View>
            <PhoneInput
              value={phone}
              onChangeText={setPhone}
              onValidationChange={setIsValid}
              style={styles.phoneInput}
            />

            <View style={{ height: 16 }} />
            <View style={styles.inputHeader}>
              <MaterialCommunityIcons
                name="lock"
                size={20}
                color={C.brandAccent}
              />
              <Text style={styles.inputLabel}>{t("pin_code")}</Text>
            </View>
            <View
              style={[
                styles.pinInputWrapper,
                { backgroundColor: C.brandSurface, borderColor: C.brandAccent },
              ]}
            >
              <TextInput
                value={pin}
                onChangeText={setPin}
                placeholder={t("enter_pin")}
                placeholderTextColor="#9CA3AF"
                secureTextEntry
                keyboardType="number-pad"
                style={styles.pinInput}
                maxLength={6}
              />
            </View>
          </View>

          <View style={{ paddingHorizontal: 24 }}>
            <TouchableOpacity
              activeOpacity={0.8}
              disabled={!isValid || isLoading}
              onPress={handleContinue}
              style={styles.continueButton}
            >
              <LinearGradient
                colors={[C.brandStart, C.brandEnd]}
                style={{
                  width: "100%",
                  paddingVertical: 16,
                  borderRadius: 16,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: "#fff",
                    fontWeight: "700",
                    fontSize: 16,
                  }}
                >
                  {t("login")}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <View style={styles.accountContainer}>
              <Text style={styles.accountText}>{t("dont_have_account")}</Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
                <Text style={styles.accountLink}>{t("create_account")}</Text>
              </TouchableOpacity>
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
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  languageButton: {
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  headerRegisterBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.28)",
  },
  headerRegisterText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 14,
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
    marginBottom: 24,
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.85)",
    textAlign: "center",
  },
  inputSection: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: Colors.light.brandAccent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 14,
    elevation: 6,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  inputHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2d3748",
    marginLeft: 8,
  },
  phoneInput: {
    marginBottom: 8,
  },
  pinInputWrapper: {
    backgroundColor: Colors.light.brandSurface,
    borderWidth: 2,
    borderColor: "#cfd8dc",
    borderRadius: 14,
    paddingHorizontal: 16,
  },
  pinInput: {
    height: 48,
    fontSize: 16,
    color: "#111827",
  },
  continueButton: {
    marginBottom: 24,
    marginTop: -8,
    shadowColor: Colors.light.brandAccent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 10,
  },
  footer: {
    alignItems: "center",
  },
  accountContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  accountText: {
    fontSize: 14,
    color: "#ffffff",
    opacity: 0.9,
    marginRight: 8,
  },
  accountLink: {
    fontSize: 14,
    color: "#ffffff",
    fontWeight: "700",
    textDecorationLine: "underline",
  },
});

export default LoginScreen;
