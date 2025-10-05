// import PhoneInput from "@/components/auth/PhoneInput";
// import AppButton from "@/components/common/AppButton";
// import { useAuth } from "@/context/AuthContext";
import PhoneInput from "@/src/components/auth/PhoneInput";
import AppButton from "@/src/components/common/AppButton";
import { useAuth } from "@/src/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");

export default function RegisterScreen({ navigation }) {
  const { t, i18n } = useTranslation();
  const { isLoading } = useAuth();
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isValid, setIsValid] = useState(false);

  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];
  const isRTL = i18n.language === "am";

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
  }, []);

  const handleRegister = async () => {
    if (!isValid || !name || !email) {
      Alert.alert(t("incomplete_info"), t("please_fill_all_fields"), [
        { text: t("ok") },
      ]);
      return;
    }

    // Handle registration logic here
    Alert.alert(
      t("registration_successful"),
      t("account_created_successfully"),
      [{ text: t("ok"), onPress: () => navigation.navigate("login") }]
    );
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
        colors={["#667eea", "#764ba2"]}
        style={styles.background}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
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
          <View style={styles.welcomeSection}>
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={["#ffffff", "#f8f9fa"]}
                style={styles.logoBackground}
              >
                <Ionicons name="person-add" size={40} color="#667eea" />
              </LinearGradient>
            </View>

            <Text style={styles.title}>{t("create_account")}</Text>
            <Text style={styles.subtitle}>
              {t("join_travelease_community")}
            </Text>
          </View>

          <View style={styles.inputSection}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{t("full_name")}</Text>
              <View style={styles.textInputWrapper}>
                <Ionicons
                  name="person-outline"
                  size={20}
                  color="#a0aec0"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.textInput}
                  placeholder={t("enter_full_name")}
                  placeholderTextColor="#a0aec0"
                  value={name}
                  onChangeText={setName}
                  selectionColor="#667eea"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{t("email")}</Text>
              <View style={styles.textInputWrapper}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color="#a0aec0"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.textInput}
                  placeholder={t("enter_email")}
                  placeholderTextColor="#a0aec0"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  selectionColor="#667eea"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{t("phone_number")}</Text>
              <PhoneInput
                value={phone}
                onChangeText={setPhone}
                onValidationChange={setIsValid}
                style={styles.phoneInput}
              />
            </View>

            <Text style={styles.helperText}>
              {t("we_will_send_otp_verification")}
            </Text>
          </View>

          <AppButton
            title={t("create_account")}
            onPress={handleRegister}
            disabled={!isValid || !name || !email || isLoading}
            loading={isLoading}
            style={styles.registerButton}
            gradient={["#667eea", "#764ba2"]}
            icon="person-add"
          />

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>{t("already_have_account")}</Text>
            <TouchableOpacity onPress={() => navigation.navigate("login")}>
              <Text style={styles.loginLink}>{t("sign_in")}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

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
    height: height * 0.6,
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
    marginTop: 20,
  },
  welcomeSection: {
    alignItems: "center",
    marginBottom: 40,
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
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2d3748",
    marginBottom: 8,
  },
  textInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f7fafc",
    borderWidth: 2,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    overflow: "hidden",
  },
  inputIcon: {
    paddingHorizontal: 16,
  },
  textInput: {
    flex: 1,
    paddingVertical: 14,
    paddingRight: 16,
    fontSize: 16,
    color: "#2d3748",
  },
  phoneInput: {
    marginBottom: 0,
  },
  helperText: {
    fontSize: 14,
    color: "#718096",
    marginTop: 8,
  },
  registerButton: {
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
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  loginText: {
    fontSize: 14,
    color: "#ffffff",
    marginRight: 8,
  },
  loginLink: {
    fontSize: 14,
    color: "#ffffff",
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});
