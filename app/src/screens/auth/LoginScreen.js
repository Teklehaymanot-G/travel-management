import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import PhoneInputComponent from "../../components/auth/PhoneInput";
import AppButton from "../../components/common/AppButton.js";
import theme from "../../config/theme";
import { useAuth } from "../../context/AuthContext";

const LoginScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [phone, setPhone] = useState("");
  const [isValid, setIsValid] = useState(false);
  const { requestOTP, isLoading } = useAuth();

  const handleContinue = async () => {
    if (isValid) {
      const success = await requestOTP(phone);
      if (success) {
        navigation.navigate("OTPVerification", { phone });
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.content}>
        {/* <Image
          source={require("../../assets/images/travel-login.jpg")}
          style={styles.image}
        /> */}
        <Text style={styles.title}>{t("welcome")}</Text>
        <Text style={styles.subtitle}>{t("sign_in")}</Text>

        <PhoneInputComponent
          value={phone}
          onChangeText={setPhone}
          onValidationChange={setIsValid}
          label={t("phone_number")}
        />

        <AppButton
          title={t("continue")}
          onPress={handleContinue}
          disabled={!isValid || isLoading}
          loading={isLoading}
          style={styles.button}
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>{t("terms")}</Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  content: {
    flex: 1,
    padding: theme.spacing.m,
    justifyContent: "center",
  },
  image: {
    width: "100%",
    height: 250,
    resizeMode: "contain",
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: theme.fontSize.xxlarge,
    fontWeight: "bold",
    textAlign: "center",
    color: theme.colors.dark,
    marginBottom: theme.spacing.s,
  },
  subtitle: {
    fontSize: theme.fontSize.large,
    textAlign: "center",
    color: theme.colors.gray,
    marginBottom: theme.spacing.xl,
  },
  button: {
    marginTop: theme.spacing.m,
  },
  footer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: theme.spacing.xl,
  },
  footerText: {
    fontSize: theme.fontSize.small,
    color: theme.colors.gray,
  },
  footerLink: {
    fontSize: theme.fontSize.small,
    color: theme.colors.primary,
    fontWeight: "bold",
  },
});

export default LoginScreen;
