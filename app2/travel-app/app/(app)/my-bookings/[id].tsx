import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
// Removed duplicate import of useLocalSearchParams/useRouter
import { getMyBookings } from "@/src/services/bookingService";
import { createPayment, validateCoupon } from "@/src/services/paymentService";
import { getBanks } from "@/src/services/bankService";
import { Ionicons } from "@expo/vector-icons";
// DateTimePicker dynamically imported; ensure dependency installed
// @ts-ignore - types may not be present until package installed
import DateTimePicker from "@react-native-community/datetimepicker";
import { useTranslation } from "react-i18next";
import * as ImagePicker from "expo-image-picker";
import Constants from "expo-constants";
import { resolveImageUrl } from "@/src/utils/image";
import * as Clipboard from "expo-clipboard";

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { t } = useTranslation();

  const [booking, setBooking] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Payment form state
  const [bank, setBank] = useState("");
  const [transactionNumber, setTransactionNumber] = useState("");
  const [paymentDate, setPaymentDate] = useState(""); // YYYY-MM-DD
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [receipt, setReceipt] = useState<any | null>(null);
  const [banks, setBanks] = useState<any[]>([]);
  const [bankLoading, setBankLoading] = useState(false);
  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [couponInfo, setCouponInfo] = useState<any | null>(null);
  const [couponError, setCouponError] = useState<string>("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  // Date picker could be implemented with a modal; keep flag if needed later.
  const [copiedAccount, setCopiedAccount] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getMyBookings({ page: 1, limit: 100 });
      const found = (res?.data || []).find(
        (b: any) => String(b.id) === String(id)
      );
      setBooking(found || null);
    } catch (e: any) {
      Alert.alert(
        t("error") || "Error",
        e?.message || "Failed to load booking"
      );
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  useEffect(() => {
    load();
  }, [load]);

  // Reload booking whenever screen gains focus (after approval elsewhere)
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  // Load banks once
  useEffect(() => {
    (async () => {
      try {
        setBankLoading(true);
        const res = await getBanks({ status: "ACTIVE" });
        setBanks(res.data || []);
      } catch (e: any) {
        // silent fail; user can still type bank manually
        console.warn("Failed to load banks", e.message);
      } finally {
        setBankLoading(false);
      }
    })();
  }, []);

  // Initialize paymentDate to today if empty
  useEffect(() => {
    if (!paymentDate) {
      const d = new Date();
      const iso = d.toISOString().substring(0, 10);
      setPaymentDate(iso);
    }
  }, [paymentDate]);

  const participantsCount = useMemo(() => {
    return Array.isArray(booking?.participants)
      ? Math.max(1, booking.participants.length)
      : 1;
  }, [booking]);

  const unitPrice = booking?.travel?.price || 0;
  const baseAmount = useMemo(
    () => unitPrice * participantsCount,
    [unitPrice, participantsCount]
  );
  const discountAmount = couponInfo?.data?.discountAmount ?? 0;
  const finalAmount = couponInfo?.data?.finalAmount ?? baseAmount;

  const onApplyCoupon = async () => {
    setCouponError("");
    setApplyingCoupon(true);
    try {
      if (!couponCode?.trim()) {
        setCouponError(t("enter_coupon_code") || "Enter coupon code");
        return;
      }
      const res = await validateCoupon({
        code: couponCode.trim(),
        amount: unitPrice,
        participants: participantsCount,
      });
      setCouponInfo(res);
    } catch (e: any) {
      setCouponInfo(null);
      setCouponError(e?.message || t("invalid_coupon") || "Invalid coupon");
    } finally {
      setApplyingCoupon(false);
    }
  };

  const pickReceipt = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          t("permission_required") || "Permission required",
          t("allow_media_library") || "Allow media library to upload receipts."
        );
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });
      if (!result.canceled) setReceipt(result.assets[0]);
    } catch {
      Alert.alert(
        t("error") || "Error",
        t("failed_to_pick_image") || "Failed to pick image"
      );
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          t("permission_required") || "Permission required",
          t("allow_camera") || "Allow camera to take a receipt photo."
        );
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
      });
      if (!result.canceled) setReceipt(result.assets[0]);
    } catch {
      Alert.alert(
        t("error") || "Error",
        t("failed_to_take_photo") || "Failed to take photo"
      );
    }
  };

  const canSubmitPayment = useMemo(() => {
    if (!booking) return false;
    // Allowed when no payment yet or previous payment was rejected
    const allowed = !booking.payment || booking.payment.status === "REJECTED";
    return (
      allowed && !!bank && !!transactionNumber && !!paymentDate && !!receipt
    );
  }, [bank, transactionNumber, paymentDate, receipt, booking]);

  // Selected bank reference (must be before any conditional returns)
  const selectedBank = useMemo(() => {
    return banks.find((b) => b.name === bank) || null;
  }, [banks, bank]);

  const submitPayment = async () => {
    if (!booking) return;
    try {
      setSubmitting(true);
      const receiptUrl = receipt?.base64
        ? `data:image/jpeg;base64,${receipt.base64}`
        : receipt?.uri;
      const payload = {
        bookingId: booking.id,
        receiptUrl,
        transactionNumber,
        bank,
        paymentDate,
        couponCode: couponInfo?.data?.code || couponCode?.trim() || undefined,
      };
      await createPayment(payload);
      Alert.alert(
        t("payment_submitted") || "Payment Submitted",
        t("awaiting_approval") || "Your payment is pending admin approval."
      );
      await load();
    } catch (e: any) {
      Alert.alert(
        t("error") || "Error",
        e?.message || "Failed to submit payment"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>{t("loading")}...</Text>
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>
          {t("booking_not_found") || "Booking not found"}
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#1a202c" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {t("booking_detail") || "Booking Detail"}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.section}>
          <Text style={styles.title}>{booking.travel?.title}</Text>
          <Text style={styles.muted}>
            {t("status")}: {booking.status}
          </Text>
          {booking?.payment?.status && (
            <Text style={styles.muted}>
              {t("payment")}: {booking.payment.status}
            </Text>
          )}
          {booking?.payment?.status === "REJECTED" &&
          booking?.payment?.rejectionMessage ? (
            <Text style={[styles.muted, { color: "#e53e3e" }]}>
              {t("rejection_reason") || "Rejection reason"}:{" "}
              {booking.payment.rejectionMessage}
            </Text>
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t("participants") || "Participants"}
          </Text>
          {Array.isArray(booking.participants) &&
          booking.participants.length > 0 ? (
            booking.participants.map((p: any, idx: number) => (
              <View key={idx} style={styles.rowBetween}>
                <Text style={styles.itemText}>
                  {idx + 1}. {String(p.name)}
                </Text>
                <Text style={styles.muted}>
                  {p.ageGroup
                    ? String(p.ageGroup)
                    : p.age
                    ? `${String(p.age)} ${t("yrs") || "yrs"}`
                    : ""}
                  {p.gender ? ` • ${String(p.gender)}` : ""}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.muted}>
              {t("no_participants") || "No participants data."}
            </Text>
          )}
        </View>

        {/* Payment form or state */}
        {!booking.payment || booking.payment.status === "REJECTED" ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t("add_payment") || "Add Payment"}
            </Text>
            <Text style={styles.muted}>
              {t("participants") || "Participants"}: {participantsCount}
            </Text>
            <View style={{ height: 6 }} />
            <View style={styles.rowBetween}>
              <Text style={styles.muted}>{t("amount") || "Amount"}</Text>
              <Text style={styles.itemText}>${baseAmount.toFixed(2)}</Text>
            </View>
            <View style={styles.rowBetween}>
              <Text style={styles.muted}>{t("discount") || "Discount"}</Text>
              <Text style={[styles.itemText, { color: "#667eea" }]}>
                {discountAmount
                  ? `- $${Number(discountAmount).toFixed(2)}`
                  : "—"}
              </Text>
            </View>
            <View style={[styles.rowBetween, { marginTop: 4 }]}>
              <Text style={[styles.itemText, { fontWeight: "700" }]}>
                {t("total") || "Total"}
              </Text>
              <Text
                style={[
                  styles.itemText,
                  { color: "#2b6cb0", fontWeight: "700" },
                ]}
              >
                ${Number(finalAmount).toFixed(2)}
              </Text>
            </View>
            <View style={{ height: 12 }} />

            {/* Coupon */}
            <Text style={styles.label}>{t("coupon") || "Coupon"}</Text>
            <View
              style={{ flexDirection: "row", gap: 8, alignItems: "center" }}
            >
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder={t("enter_coupon_code") || "Enter coupon code"}
                value={couponCode}
                autoCapitalize="characters"
                onChangeText={setCouponCode}
              />
              <TouchableOpacity
                onPress={onApplyCoupon}
                disabled={applyingCoupon}
                style={[
                  styles.uploadButton,
                  { borderColor: applyingCoupon ? "#cbd5e0" : "#667eea" },
                ]}
              >
                <Text style={[styles.uploadText, { marginLeft: 0 }]}>
                  {t("apply") || "Apply"}
                </Text>
              </TouchableOpacity>
            </View>
            {couponError ? (
              <Text style={{ color: "#e53e3e", marginTop: 6 }}>
                {couponError}
              </Text>
            ) : null}
            {couponInfo?.data?.code ? (
              <Text style={{ color: "#2f855a", marginTop: 6 }}>
                {(t("coupon_applied") || "Coupon applied") + ": "}
                {couponInfo.data.code}
              </Text>
            ) : null}

            <Text style={styles.label}>{t("bank") || "Bank"}</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: 8 }}
            >
              {bankLoading ? (
                <View style={styles.bankPillLoading}>
                  <Text style={styles.bankPillText}>
                    {t("loading") || "Loading"}
                  </Text>
                </View>
              ) : banks.length > 0 ? (
                banks.map((b) => {
                  const selected = bank === b.name;
                  return (
                    <TouchableOpacity
                      key={b.id}
                      style={[
                        styles.bankPill,
                        selected && styles.bankPillSelected,
                      ]}
                      onPress={() => setBank(b.name)}
                    >
                      {b.logoUrl ? (
                        <Image
                          source={{ uri: resolveImageUrl(b.logoUrl) ?? "" }}
                          // source={{ uri: b.logoUrl }}
                          style={styles.bankLogo}
                        />
                      ) : null}
                      <Text
                        style={[
                          styles.bankPillText,
                          selected && styles.bankPillTextSelected,
                        ]}
                      >
                        {b.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })
              ) : (
                <View style={styles.bankPillEmpty}>
                  <Text style={styles.bankPillTextSmall}>
                    {t("no_banks") || "No banks"}
                  </Text>
                </View>
              )}
            </ScrollView>
            {selectedBank && (
              <View style={styles.bankDetailCard}>
                <View style={styles.bankDetailHeader}>
                  {selectedBank.logoUrl ? (
                    <Image
                      source={{
                        uri: resolveImageUrl(selectedBank.logoUrl) ?? "",
                      }}
                      style={styles.bankDetailLogo}
                    />
                  ) : null}
                  <Text style={styles.bankDetailName}>{selectedBank.name}</Text>
                </View>
                <View style={styles.bankDetailLine}>
                  <Text style={styles.bankDetailLabel}>
                    {t("account_name") || "Account Name"}:
                  </Text>
                  <Text style={styles.bankDetailValue}>
                    {selectedBank.accountName}
                  </Text>
                </View>
                <View style={styles.bankDetailLine}>
                  <Text style={styles.bankDetailLabel}>
                    {t("account_number") || "Account Number"}:
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      flex: 1,
                      justifyContent: "space-between",
                    }}
                  >
                    <Text style={[styles.bankDetailValue, { flexShrink: 1 }]}>
                      {selectedBank.accountNumber}
                    </Text>
                    <TouchableOpacity
                      onPress={async () => {
                        await Clipboard.setStringAsync(
                          String(selectedBank.accountNumber || "")
                        );
                        setCopiedAccount(true);
                        setTimeout(() => setCopiedAccount(false), 1800);
                      }}
                      style={{
                        marginLeft: 12,
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        borderWidth: 1,
                        borderColor: copiedAccount ? "#48bb78" : "#cbd5e0",
                        borderRadius: 8,
                        backgroundColor: copiedAccount ? "#f0fff4" : "#ffffff",
                      }}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          color: copiedAccount ? "#2f855a" : "#667eea",
                          fontWeight: "600",
                        }}
                      >
                        {copiedAccount
                          ? t("copied") || "Copied"
                          : t("copy") || "Copy"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
            {!banks.length && (
              <TextInput
                style={styles.input}
                placeholder={t("enter_bank") || "Enter bank"}
                value={bank}
                onChangeText={setBank}
              />
            )}

            <Text style={styles.label}>
              {t("transaction_number") || "Transaction number"}
            </Text>
            <TextInput
              style={styles.input}
              placeholder={
                t("enter_transaction_number") || "Enter transaction number"
              }
              value={transactionNumber}
              onChangeText={setTransactionNumber}
            />

            <Text style={styles.label}>
              {t("payment_date") || "Payment date"}
            </Text>
            <TouchableOpacity
              style={[styles.input, { justifyContent: "center" }]}
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.dateText}>{paymentDate || "YYYY-MM-DD"}</Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={paymentDate ? new Date(paymentDate) : new Date()}
                mode="date"
                display={Platform.OS === "ios" ? "inline" : "default"}
                onChange={(event: any, selectedDate?: Date) => {
                  if (Platform.OS === "android") {
                    setShowDatePicker(false);
                  }
                  if (selectedDate) {
                    const iso = selectedDate.toISOString().substring(0, 10);
                    setPaymentDate(iso);
                  } else if (
                    Platform.OS === "ios" &&
                    event?.type === "dismissed"
                  ) {
                    setShowDatePicker(false);
                  }
                }}
                maximumDate={new Date()}
              />
            )}

            <Text style={styles.label}>{t("receipt") || "Receipt"}</Text>
            {receipt ? (
              <View style={{ alignItems: "center", marginBottom: 8 }}>
                <Image
                  source={{ uri: receipt.uri }}
                  style={{ width: 220, height: 160, borderRadius: 8 }}
                />
                <TouchableOpacity
                  onPress={() => setReceipt(null)}
                  style={{ marginTop: 8 }}
                >
                  <Text style={{ color: "#e53e3e" }}>
                    {t("remove") || "Remove"}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={{ flexDirection: "row", gap: 12 }}>
                <TouchableOpacity
                  style={styles.uploadButton}
                  onPress={pickReceipt}
                >
                  <Ionicons name="image-outline" color="#667eea" size={20} />
                  <Text style={styles.uploadText}>
                    {t("choose_from_gallery") || "Choose from gallery"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.uploadButton}
                  onPress={takePhoto}
                >
                  <Ionicons name="camera-outline" color="#667eea" size={20} />
                  <Text style={styles.uploadText}>
                    {t("take_photo") || "Take photo"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity
              disabled={!canSubmitPayment || submitting}
              onPress={submitPayment}
              style={[
                styles.submitButton,
                (!canSubmitPayment || submitting) &&
                  styles.submitButtonDisabled,
              ]}
            >
              <Text style={styles.submitText}>
                {submitting
                  ? t("submitting") || "Submitting..."
                  : t("submit_payment") || "Submit Payment"}
              </Text>
            </TouchableOpacity>
          </View>
        ) : booking.payment.status === "PENDING" ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t("waiting_confirmation") || "Waiting for confirmation"}
            </Text>
            <Text style={styles.muted}>
              {t("payment_pending_description") ||
                "Your payment is pending admin approval."}
            </Text>
          </View>
        ) : booking.payment.status === "APPROVED" ? (
          <View style={styles.section}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={styles.sectionTitle}>
                {t("tickets") || "Tickets"}
              </Text>
              {/* Scan button for supervisor/manager */}
              {booking?.traveler?.role &&
                ["SUPERVISOR", "MANAGER"].includes(booking.traveler.role) && (
                  <TouchableOpacity
                    onPress={() => router.push("/(app)/scan-ticket")}
                    style={{
                      backgroundColor: "#667eea",
                      paddingVertical: 6,
                      paddingHorizontal: 14,
                      borderRadius: 8,
                    }}
                  >
                    <Text
                      style={{ color: "#fff", fontSize: 12, fontWeight: "600" }}
                    >
                      {t("scan") || "Scan"}
                    </Text>
                  </TouchableOpacity>
                )}
              <TouchableOpacity
                onPress={load}
                style={{
                  backgroundColor: "#edf2f7",
                  paddingVertical: 6,
                  paddingHorizontal: 12,
                  borderRadius: 8,
                }}
              >
                <Text
                  style={{ color: "#2d3748", fontSize: 12, fontWeight: "600" }}
                >
                  {t("refresh") || "Refresh"}
                </Text>
              </TouchableOpacity>
            </View>
            {Array.isArray(booking.tickets) && booking.tickets.length > 0 ? (
              booking.tickets.map((ticket: any) => (
                <View
                  key={ticket.id}
                  style={[styles.ticket, { marginBottom: 12 }]}
                >
                  <Text style={styles.itemText}>
                    {ticket.name} • #{ticket.badgeNumber || ticket.id}
                  </Text>

                  {(() => {
                    const qrUri = resolveImageUrl(ticket.qrCodeUrl);
                    return qrUri ? (
                      <Image
                        source={{ uri: qrUri }}
                        style={{ width: 160, height: 160 }}
                        resizeMode="contain"
                      />
                    ) : (
                      <Text style={styles.muted}>
                        {t("qr_generation_pending") || "QR generation pending"}
                      </Text>
                    );
                  })()}
                </View>
              ))
            ) : (
              <Text style={styles.muted}>
                {t("tickets_generating") ||
                  "Tickets generating. Pull to refresh."}
              </Text>
            )}
          </View>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  muted: { color: "#718096" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f7fafc",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "600", color: "#1a202c" },
  section: { padding: 16, borderBottomWidth: 1, borderBottomColor: "#e2e8f0" },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a202c",
    marginBottom: 12,
  },
  title: { fontSize: 18, fontWeight: "700", color: "#1a202c" },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  itemText: { color: "#2d3748" },
  label: { fontSize: 12, color: "#718096", marginTop: 12, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    padding: 10,
  },
  dateText: { color: "#2d3748", fontSize: 14 },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#667eea",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  uploadText: { color: "#667eea", marginLeft: 6, fontWeight: "500" },
  submitButton: {
    backgroundColor: "#667eea",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 16,
  },
  submitButtonDisabled: { backgroundColor: "#cbd5e0" },
  submitText: { color: "#fff", fontWeight: "700" },
  ticket: {
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
  },
  bankPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#cbd5e0",
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: "#f7fafc",
  },
  bankPillSelected: {
    borderColor: "#667eea",
    backgroundColor: "#667eea",
  },
  bankPillText: { fontSize: 12, color: "#2d3748", fontWeight: "500" },
  bankPillTextSelected: { color: "#fff" },
  bankLogo: { width: 24, height: 24, marginRight: 6, resizeMode: "contain" },
  bankPillEmpty: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#cbd5e0",
    borderRadius: 20,
    backgroundColor: "#edf2f7",
  },
  bankPillTextSmall: { fontSize: 12, color: "#718096" },
  bankPillLoading: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#cbd5e0",
    borderRadius: 20,
    backgroundColor: "#f7fafc",
  },
  bankDetailCard: {
    borderWidth: 1,
    borderColor: "#cbd5e0",
    borderRadius: 10,
    padding: 12,
    backgroundColor: "#f8fafc",
    marginBottom: 4,
  },
  bankDetailHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  bankDetailLogo: { width: 32, height: 32, marginRight: 10 },
  bankDetailName: { fontSize: 14, fontWeight: "600", color: "#2d3748" },
  bankDetailLine: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  bankDetailLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4a5568",
    marginRight: 4,
  },
  bankDetailValue: { fontSize: 12, color: "#2d3748" },
});
