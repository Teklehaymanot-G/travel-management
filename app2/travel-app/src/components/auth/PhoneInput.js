import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const countries = [
  { code: "ET", name: "Ethiopia", dialCode: "+251", flag: "🇪🇹" },
  { code: "US", name: "United States", dialCode: "+1", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", dialCode: "+44", flag: "🇬🇧" },
  { code: "KE", name: "Kenya", dialCode: "+254", flag: "🇰🇪" },
  { code: "EG", name: "Egypt", dialCode: "+20", flag: "🇪🇬" },
];

const PhoneInput = ({ value, onChangeText, onValidationChange, style }) => {
  const { t, i18n } = useTranslation();
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  const handlePhoneChange = (text) => {
    const cleanedText = text.replace(/[^0-9]/g, "");
    setPhoneNumber(cleanedText);

    const fullPhone = selectedCountry.dialCode + cleanedText;
    const isValid = validatePhoneNumber(fullPhone);

    onChangeText(fullPhone);
    onValidationChange(isValid);
  };

  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    return phoneRegex.test(phone) && phone.length >= 10;
  };

  const selectCountry = (country) => {
    setSelectedCountry(country);
    setShowCountryPicker(false);

    const fullPhone = country.dialCode + phoneNumber;
    const isValid = validatePhoneNumber(fullPhone);

    onChangeText(fullPhone);
    onValidationChange(isValid);
  };

  const renderCountryItem = ({ item }) => (
    <TouchableOpacity
      style={styles.countryItem}
      onPress={() => selectCountry(item)}
    >
      <Text style={styles.flag}>{item.flag}</Text>
      <Text style={styles.countryName}>{item.name}</Text>
      <Text style={styles.dialCode}>{item.dialCode}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, style]}>
      <View style={styles.inputContainer}>
        <TouchableOpacity
          style={styles.countryPicker}
          onPress={() => setShowCountryPicker(true)}
        >
          <Text style={styles.flag}>{selectedCountry.flag}</Text>
          <Text style={styles.dialCode}>{selectedCountry.dialCode}</Text>
          <Ionicons name="chevron-down" size={16} color="#4F46E5" />
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder={t("enter_phone_number")}
          placeholderTextColor="#9CA3AF"
          keyboardType="phone-pad"
          value={phoneNumber}
          onChangeText={handlePhoneChange}
          maxLength={15}
          selectionColor="#4F46E5"
        />
      </View>

      <Modal
        visible={showCountryPicker}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t("select_country")}</Text>
            <TouchableOpacity
              onPress={() => setShowCountryPicker(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#4F46E5" />
            </TouchableOpacity>
          </View>

          <FlatList
            data={countries}
            renderItem={renderCountryItem}
            keyExtractor={(item) => item.code}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    overflow: "hidden",
  },
  countryPicker: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRightWidth: 2,
    borderRightColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  flag: {
    fontSize: 20,
    marginRight: 8,
  },
  dialCode: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4F46E5",
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: "#1F2937",
    backgroundColor: "#F9FAFB",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingTop: 60,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  closeButton: {
    padding: 4,
  },
  countryItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  countryName: {
    flex: 1,
    fontSize: 16,
    color: "#1F2937",
    marginLeft: 12,
  },
});

export default PhoneInput;
