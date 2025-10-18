import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { t } from "i18next";
import { useState } from "react";
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const PaymentSection = () => {
  const [paymentStep, setPaymentStep] = useState("select_method"); // 'select_method', 'bank_details', 'confirm_payment', 'pending', 'confirmed'
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [screenshot, setScreenshot] = useState<any>(null);
  const [referenceNumber, setReferenceNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Bank account details
  const bankAccounts = [
    {
      id: "1",
      bankName: "Commercial Bank of Ethiopia",
      accountName: "Ethio Travel Tours",
      accountNumber: "1000203040506",
      branch: "Main Branch",
    },
    {
      id: "2",
      bankName: "Awash Bank",
      accountName: "Ethio Travel Tours",
      accountNumber: "2000304050607",
      branch: "Head Office",
    },
  ];

  const handlePaymentMethodSelect = (method: string) => {
    setSelectedPaymentMethod(method);
    setPaymentStep("bank_details");
  };

  const pickScreenshot = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission required",
          "Sorry, we need camera roll permissions to upload screenshots."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setScreenshot(result.assets[0]);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission required",
          "Sorry, we need camera permissions to take photos."
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setScreenshot(result.assets[0]);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to take photo");
    }
  };

  const handleSubmitPayment = () => {
    if (!screenshot || !referenceNumber || !amount) {
      Alert.alert(
        "Incomplete Information",
        "Please fill all fields and attach payment screenshot"
      );
      return;
    }

    setPaymentStep("pending");
    // Here you would typically send the data to your backend
    console.log("Payment submitted:", {
      referenceNumber,
      amount,
      screenshot: screenshot.uri,
    });
  };

  const simulatePaymentConfirmation = () => {
    setPaymentStep("confirmed");
    Alert.alert(
      "Payment Confirmed",
      "Your payment has been confirmed successfully!"
    );
  };

  const renderPaymentMethodSelection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{t("payment_method")}</Text>
      <TouchableOpacity
        style={styles.paymentMethod}
        onPress={() => handlePaymentMethodSelect("bank_transfer")}
      >
        <View style={styles.paymentLeft}>
          <Ionicons name="business-outline" size={24} color="#4a5568" />
          <View style={styles.paymentTextContainer}>
            <Text style={styles.paymentText}>{t("bank_transfer")}</Text>
            <Text style={styles.paymentSubtext}>
              {t("bank_transfer_description")}
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#cbd5e0" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.paymentMethod}
        onPress={() => handlePaymentMethodSelect("card")}
      >
        <View style={styles.paymentLeft}>
          <Ionicons name="card-outline" size={24} color="#4a5568" />
          <View style={styles.paymentTextContainer}>
            <Text style={styles.paymentText}>{t("credit_debit_card")}</Text>
            <Text style={styles.paymentSubtext}>
              {t("card_payment_description")}
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#cbd5e0" />
      </TouchableOpacity>
    </View>
  );

  const renderBankDetails = () => (
    <ScrollView style={styles.section}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => setPaymentStep("select_method")}
      >
        <Ionicons name="arrow-back" size={20} color="#4a5568" />
        <Text style={styles.backText}>{t("back_to_payment_methods")}</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>{t("bank_transfer_instructions")}</Text>
      <Text style={styles.instructionText}>{t("bank_transfer_guide")}</Text>

      {bankAccounts.map((account) => (
        <View key={account.id} style={styles.bankAccountCard}>
          <Text style={styles.bankName}>{account.bankName}</Text>
          <View style={styles.accountDetail}>
            <Text style={styles.detailLabel}>{t("account_name")}:</Text>
            <Text style={styles.detailValue}>{account.accountName}</Text>
          </View>
          <View style={styles.accountDetail}>
            <Text style={styles.detailLabel}>{t("account_number")}:</Text>
            <Text style={styles.detailValue}>{account.accountNumber}</Text>
          </View>
          <View style={styles.accountDetail}>
            <Text style={styles.detailLabel}>{t("branch")}:</Text>
            <Text style={styles.detailValue}>{account.branch}</Text>
          </View>
        </View>
      ))}

      <TouchableOpacity
        style={styles.continueButton}
        onPress={() => setIsModalVisible(true)}
      >
        <Text style={styles.continueButtonText}>
          {t("i_have_made_payment")}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderPaymentConfirmation = () => (
    <Modal
      visible={isModalVisible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{t("confirm_payment")}</Text>
          <TouchableOpacity onPress={() => setIsModalVisible(false)}>
            <Ionicons name="close" size={24} color="#4a5568" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <Text style={styles.instructionText}>
            {t("upload_payment_proof")}
          </Text>

          {/* Reference Number */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t("reference_number")}</Text>
            <TextInput
              style={styles.textInput}
              value={referenceNumber}
              onChangeText={setReferenceNumber}
              placeholder={t("enter_reference_number")}
            />
          </View>

          {/* Amount */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t("amount_paid")}</Text>
            <TextInput
              style={styles.textInput}
              value={amount}
              onChangeText={setAmount}
              placeholder={t("enter_amount")}
              keyboardType="numeric"
            />
          </View>

          {/* Screenshot Upload */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t("payment_screenshot")}</Text>
            {screenshot ? (
              <View style={styles.screenshotPreview}>
                <Image
                  source={{ uri: screenshot.uri }}
                  style={styles.screenshotImage}
                />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => setScreenshot(null)}
                >
                  <Ionicons name="close-circle" size={24} color="#e53e3e" />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.uploadButtons}>
                <TouchableOpacity
                  style={styles.uploadButton}
                  onPress={pickScreenshot}
                >
                  <Ionicons name="image-outline" size={24} color="#667eea" />
                  <Text style={styles.uploadButtonText}>
                    {t("choose_from_gallery")}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.uploadButton}
                  onPress={takePhoto}
                >
                  <Ionicons name="camera-outline" size={24} color="#667eea" />
                  <Text style={styles.uploadButtonText}>{t("take_photo")}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.submitButton,
              (!screenshot || !referenceNumber || !amount) &&
                styles.submitButtonDisabled,
            ]}
            onPress={handleSubmitPayment}
            disabled={!screenshot || !referenceNumber || !amount}
          >
            <Text style={styles.submitButtonText}>{t("submit_payment")}</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );

  const renderPendingConfirmation = () => (
    <View style={styles.section}>
      <View style={styles.statusContainer}>
        <Ionicons name="time-outline" size={64} color="#ed8936" />
        <Text style={styles.statusTitle}>{t("payment_pending")}</Text>
        <Text style={styles.statusText}>
          {t("payment_pending_description")}
        </Text>

        {screenshot && (
          <View style={styles.paymentProof}>
            <Text style={styles.proofTitle}>{t("payment_proof")}:</Text>
            <Image source={{ uri: screenshot.uri }} style={styles.proofImage} />
          </View>
        )}

        <View style={styles.paymentDetails}>
          <Text style={styles.detailItem}>
            <Text style={styles.detailLabel}>{t("reference_number")}: </Text>
            {referenceNumber}
          </Text>
          <Text style={styles.detailItem}>
            <Text style={styles.detailLabel}>{t("amount_paid")}: </Text>
            {amount} {t("br")}
          </Text>
        </View>

        {/* For demo purposes - simulate confirmation */}
        <TouchableOpacity
          style={styles.demoButton}
          onPress={simulatePaymentConfirmation}
        >
          <Text style={styles.demoButtonText}>
            {t("simulate_confirmation")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderConfirmed = () => (
    <View style={styles.section}>
      <View style={styles.statusContainer}>
        <Ionicons name="checkmark-circle" size={64} color="#48bb78" />
        <Text style={styles.statusTitle}>{t("payment_confirmed")}</Text>
        <Text style={styles.statusText}>
          {t("payment_confirmed_description")}
        </Text>

        <View style={styles.confirmationDetails}>
          <Text style={styles.confirmationItem}>
            <Ionicons name="checkmark" size={16} color="#48bb78" />
            <Text> {t("payment_received")}</Text>
          </Text>
          <Text style={styles.confirmationItem}>
            <Ionicons name="checkmark" size={16} color="#48bb78" />
            <Text> {t("booking_confirmed")}</Text>
          </Text>
          <Text style={styles.confirmationItem}>
            <Ionicons name="checkmark" size={16} color="#48bb78" />
            <Text> {t("itinerary_sent")}</Text>
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View>
      {paymentStep === "select_method" && renderPaymentMethodSelection()}
      {paymentStep === "bank_details" && renderBankDetails()}
      {paymentStep === "pending" && renderPendingConfirmation()}
      {paymentStep === "confirmed" && renderConfirmed()}
      {renderPaymentConfirmation()}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1a202c",
    marginBottom: 16,
  },
  paymentMethod: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    marginBottom: 12,
  },
  paymentLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  paymentTextContainer: {
    marginLeft: 12,
  },
  paymentText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2d3748",
  },
  paymentSubtext: {
    fontSize: 12,
    color: "#718096",
    marginTop: 2,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  backText: {
    marginLeft: 8,
    color: "#4a5568",
    fontSize: 16,
  },
  instructionText: {
    fontSize: 14,
    color: "#4a5568",
    lineHeight: 20,
    marginBottom: 16,
  },
  bankAccountCard: {
    backgroundColor: "#f7fafc",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#667eea",
  },
  bankName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2d3748",
    marginBottom: 8,
  },
  accountDetail: {
    flexDirection: "row",
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 14,
    color: "#718096",
    width: 100,
  },
  detailValue: {
    fontSize: 14,
    color: "#2d3748",
    fontWeight: "500",
    flex: 1,
  },
  continueButton: {
    backgroundColor: "#667eea",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  continueButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1a202c",
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2d3748",
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#ffffff",
  },
  uploadButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  uploadButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderWidth: 2,
    borderColor: "#667eea",
    borderStyle: "dashed",
    borderRadius: 8,
    marginHorizontal: 4,
  },
  uploadButtonText: {
    marginLeft: 8,
    color: "#667eea",
    fontWeight: "500",
  },
  screenshotPreview: {
    position: "relative",
    alignItems: "center",
  },
  screenshotImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
  },
  removeButton: {
    position: "absolute",
    top: -10,
    right: -10,
    backgroundColor: "#ffffff",
    borderRadius: 12,
  },
  submitButton: {
    backgroundColor: "#667eea",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  submitButtonDisabled: {
    backgroundColor: "#cbd5e0",
  },
  submitButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  statusContainer: {
    alignItems: "center",
    padding: 20,
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1a202c",
    marginVertical: 16,
  },
  statusText: {
    fontSize: 16,
    color: "#4a5568",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 20,
  },
  paymentProof: {
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
  },
  proofTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2d3748",
    marginBottom: 8,
  },
  proofImage: {
    width: 250,
    height: 188,
    borderRadius: 8,
  },
  paymentDetails: {
    width: "100%",
    backgroundColor: "#f7fafc",
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  detailItem: {
    fontSize: 14,
    color: "#4a5568",
    marginBottom: 8,
  },
  demoButton: {
    backgroundColor: "#ed8936",
    padding: 12,
    borderRadius: 6,
  },
  demoButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "500",
  },
  confirmationDetails: {
    width: "100%",
    marginTop: 20,
  },
  confirmationItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    fontSize: 16,
    color: "#2d3748",
  },
});

export default PaymentSection;
