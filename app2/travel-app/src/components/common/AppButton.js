import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";

const AppButton = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  style,
  textStyle,
  gradient = ["#667eea", "#764ba2"],
  icon,
  iconPosition = "right",
}) => {
  const ButtonContent = (
    <>
      {loading ? (
        <ActivityIndicator color="#ffffff" size="small" />
      ) : (
        <>
          {icon && iconPosition === "left" && (
            <Ionicons
              name={icon}
              size={20}
              color="#ffffff"
              style={styles.iconLeft}
            />
          )}
          <Text style={[styles.buttonText, textStyle]}>{title}</Text>
          {icon && iconPosition === "right" && (
            <Ionicons
              name={icon}
              size={20}
              color="#ffffff"
              style={styles.iconRight}
            />
          )}
        </>
      )}
    </>
  );

  if (disabled) {
    return (
      <TouchableOpacity
        style={[styles.button, styles.buttonDisabled, style]}
        disabled={true}
      >
        {ButtonContent}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={style}
    >
      <LinearGradient
        colors={gradient}
        style={[styles.button, disabled && styles.buttonDisabled]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        {ButtonContent}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    minHeight: 56,
  },
  buttonDisabled: {
    opacity: 0.6,
    border: "1px solid #000",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});

export default AppButton;
