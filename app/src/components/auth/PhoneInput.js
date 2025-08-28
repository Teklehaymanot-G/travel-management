import React, { useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import PhoneInput from "react-native-phone-number-input";
import theme from "../../config/theme";

const PhoneInputComponent = ({
  value,
  onChangeText,
  onValidationChange,
  label,
}) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isValid, setIsValid] = useState(false);
  const phoneInput = useRef(null);

  const handleChange = (text) => {
    setPhoneNumber(text);
    const valid = phoneInput.current?.isValidNumber(text);
    setIsValid(valid);
    onValidationChange(valid);
    onChangeText(text);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <PhoneInput
        ref={phoneInput}
        defaultValue={phoneNumber}
        defaultCode="US"
        layout="first"
        onChangeFormattedText={handleChange}
        containerStyle={styles.inputContainer}
        textInputStyle={styles.input}
      />
      {phoneNumber.length > 0 && !isValid && (
        <Text style={styles.errorText}>Invalid phone number</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: theme.spacing.m },
  label: {
    fontSize: theme.fontSize.medium,
    color: theme.colors.dark,
    marginBottom: theme.spacing.s,
    fontWeight: "500",
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: theme.colors.gray,
    borderRadius: theme.borderRadius.medium,
  },
  input: { fontSize: theme.fontSize.medium },
  errorText: {
    color: theme.colors.danger,
    fontSize: theme.fontSize.small,
    marginTop: theme.spacing.xs,
  },
});

export default PhoneInputComponent;
