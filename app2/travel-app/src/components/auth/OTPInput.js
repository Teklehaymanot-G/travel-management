import { useEffect, useRef, useState } from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

const OTPInput = ({ length = 6, value, onChange, autoFocus = false }) => {
  const [otp, setOtp] = useState(Array(length).fill(""));
  const inputs = useRef([]);

  useEffect(() => {
    if (autoFocus && inputs.current[0]) {
      inputs.current[0].focus();
    }
  }, [autoFocus]);

  useEffect(() => {
    const otpString = otp.join("");
    onChange(otpString);
  }, [otp]);

  const handleChange = (text, index) => {
    const newOtp = [...otp];

    // Handle paste
    if (text.length > 1) {
      const pastedOtp = text.slice(0, length).split("");
      pastedOtp.forEach((char, i) => {
        if (index + i < length) {
          newOtp[index + i] = char;
        }
      });
      setOtp(newOtp);

      // Focus last input
      const lastIndex = Math.min(index + pastedOtp.length, length - 1);
      if (inputs.current[lastIndex]) {
        inputs.current[lastIndex].focus();
      }
      return;
    }

    // Handle single character input
    newOtp[index] = text;
    setOtp(newOtp);

    // Auto focus next input
    if (text && index < length - 1) {
      inputs.current[index + 1].focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  const focusInput = (index) => {
    if (inputs.current[index]) {
      inputs.current[index].focus();
    }
  };

  return (
    <View style={styles.container}>
      {Array(length)
        .fill("")
        .map((_, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => focusInput(index)}
            activeOpacity={1}
          >
            <View
              style={[
                styles.inputContainer,
                otp[index] && styles.inputContainerFilled,
              ]}
            >
              <TextInput
                ref={(ref) => (inputs.current[index] = ref)}
                style={styles.input}
                value={otp[index]}
                onChangeText={(text) => handleChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={index === 0 ? length : 1}
                selectTextOnFocus
                textContentType="oneTimeCode"
                autoComplete="one-time-code"
              />
            </View>
          </TouchableOpacity>
        ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  inputContainer: {
    width: 50,
    height: 60,
    borderRadius: 12,
    backgroundColor: "#f7fafc",
    borderWidth: 2,
    borderColor: "#e2e8f0",
    justifyContent: "center",
    alignItems: "center",
  },
  inputContainerFilled: {
    borderColor: "#667eea",
    backgroundColor: "#ffffff",
    shadowColor: "#667eea",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  input: {
    fontSize: 20,
    fontWeight: "600",
    color: "#2d3748",
    textAlign: "center",
    width: "100%",
    height: "100%",
  },
});

export default OTPInput;
