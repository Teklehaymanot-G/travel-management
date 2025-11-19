import { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useTranslation } from "react-i18next";
import AppButton from "../../components/common/AppButton";
import * as Clipboard from "expo-clipboard";
import { getBanks } from "../../services/bankService";
import theme from "../../config/theme";
import { validateCoupon, createPayment } from "../../services/paymentService";

const PaymentScreen = ({ route, navigation }) => {
  const { t } = useTranslation();
  const { booking } = route.params;

  const participantsCount = Array.isArray(booking?.participants)
    ? Math.max(1, booking.participants.length)
    : 1;
  const unitPrice = booking?.travel?.price || 0;
  const baseAmount = unitPrice * participantsCount;

  const [couponCode, setCouponCode] = useState("");
  const [couponInfo, setCouponInfo] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [applying, setApplying] = useState(false);

  const [bank, setBank] = useState("");
  const [transactionNumber, setTransactionNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const finalAmount = couponInfo?.data?.finalAmount ?? baseAmount;
  const discountAmount = couponInfo?.data?.discountAmount ?? 0;

  const [banks, setBanks] = useState([]);
  const [banksLoading, setBanksLoading] = useState(false);
  const [copied, setCopied] = useState("");

  useEffect(() => {
    const loadBanks = async () => {
      setBanksLoading(true);
      try {
        const res = await getBanks({ status: "ACTIVE" });
        setBanks(res?.data || []);
      } catch (e) {
        // ignore for now
      } finally {
        setBanksLoading(false);
      }
    };
    loadBanks();
  }, []);

  const onApplyCoupon = async () => {
    setCouponError("");
    setApplying(true);
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
    } catch (e) {
      setCouponInfo(null);
      setCouponError(e.message || t("invalid_coupon") || "Invalid coupon");
    } finally {
      setApplying(false);
    }
  };

  const onSubmitPayment = async () => {
    setSubmitError("");
    setSubmitting(true);
    try {
      const payload = {
        bookingId: booking.id,
        bank: bank?.trim() || undefined,
        transactionNumber: transactionNumber?.trim() || undefined,
        couponCode: couponInfo?.data?.code || couponCode?.trim() || undefined,
      };
      const res = await createPayment(payload);
      if (res?.success) {
        navigation.replace("BookingConfirmation", {
          travel: booking.travel,
          travelers: booking.participants || [],
        });
      }
    } catch (e) {
      setSubmitError(
        e.message || t("payment_submit_error") || "Failed to submit payment"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.title}>{t("payment") || "Payment"}</Text>
        <Text style={styles.subtitle}>
          {t("proceed_to_payment_instruction") ||
            "Please review and submit your payment."}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t("summary") || "Summary"}</Text>
        <View style={styles.rowBetween}>
          <Text style={styles.label}>
            {t("participants") || "Participants"}
          </Text>
          <Text style={styles.value}>{participantsCount}</Text>
        </View>
        <View style={styles.rowBetween}>
          <Text style={styles.label}>{t("amount") || "Amount"}</Text>
          <Text style={styles.value}>${baseAmount}</Text>
        </View>
        <View style={styles.rowBetween}>
          <Text style={styles.label}>{t("discount") || "Discount"}</Text>
          <Text style={[styles.value, styles.discount]}>
            {discountAmount ? `- $${discountAmount}` : "—"}
          </Text>
        </View>
        <View style={[styles.rowBetween, styles.totalRow]}>
          <Text style={styles.totalLabel}>{t("total") || "Total"}</Text>
          <Text style={styles.totalValue}>${finalAmount}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t("coupon") || "Coupon"}</Text>
        <View style={styles.couponRow}>
          <TextInput
            placeholder={t("enter_coupon_code") || "Enter coupon code"}
            value={couponCode}
            onChangeText={setCouponCode}
            style={styles.input}
            autoCapitalize="characters"
          />
          <TouchableOpacity
            style={styles.applyBtn}
            onPress={onApplyCoupon}
            disabled={applying}
          >
            {applying ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.applyBtnText}>{t("apply") || "Apply"}</Text>
            )}
          </TouchableOpacity>
        </View>
        {!!couponError && <Text style={styles.errorText}>{couponError}</Text>}
        {couponInfo?.data?.code && (
          <Text style={styles.successText}>
            {t("coupon_applied") || "Coupon applied"}: {couponInfo.data.code}
          </Text>
        )}
      </View>

      {/* Participants Details */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          {t("participants") || "Participants"}
        </Text>
        {(booking?.participants || []).map((p, idx) => (
          <View key={idx} style={styles.rowBetween}>
            <Text style={styles.value}>{p.name}</Text>
            <Text style={styles.label}>
              {p.ageGroup ? `Age: ${p.ageGroup}` : `Age: ${p.age}`}{" "}
              {p.gender ? `• ${p.gender}` : ""}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          {t("bank_transfer") || "Bank Transfer"}
        </Text>
        <Text style={styles.helperText}>
          {t("bank_transfer_description") || "Transfer to our bank account"}
        </Text>

        {banksLoading ? (
          <Text style={styles.helperText}>Loading banks...</Text>
        ) : (
          banks.map((b) => (
            <View key={b.id} style={styles.bankRow}>
              <TouchableOpacity
                style={[
                  styles.bankOption,
                  bank === b.name && styles.bankOptionActive,
                ]}
                onPress={() => setBank(b.name)}
              >
                <Text style={styles.bankName}>{b.name}</Text>
                <View style={styles.accountRow}>
                  <Text style={styles.accountNumber}>{b.accountNumber}</Text>
                  <TouchableOpacity
                    onPress={async () => {
                      await Clipboard.setStringAsync(
                        String(b.accountNumber || "")
                      );
                      setCopied(b.accountNumber);
                      setTimeout(() => setCopied(""), 1500);
                    }}
                    style={styles.copyBtn}
                  >
                    <Text style={styles.copyIcon}>📋</Text>
                  </TouchableOpacity>
                </View>
                {copied === b.accountNumber && (
                  <Text style={styles.copiedText}>Copied</Text>
                )}
              </TouchableOpacity>
            </View>
          ))
        )}

        <TextInput
          placeholder={
            t("enter_transaction_number") || "Enter transaction number"
          }
          value={transactionNumber}
          onChangeText={setTransactionNumber}
          style={styles.input}
        />
      </View>

      {!!submitError && <Text style={styles.errorText}>{submitError}</Text>}
      <AppButton
        title={t("submit_payment") || "Submit Payment"}
        onPress={onSubmitPayment}
        disabled={submitting}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.white },
  content: { padding: theme.spacing.m },
  section: { marginBottom: theme.spacing.m },
  title: {
    fontSize: theme.fontSize.xlarge,
    fontWeight: "bold",
    color: theme.colors.dark,
  },
  subtitle: { fontSize: theme.fontSize.medium, color: theme.colors.gray },
  card: {
    backgroundColor: theme.colors.light,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.m,
  },
  cardTitle: {
    fontSize: theme.fontSize.large,
    fontWeight: "bold",
    color: theme.colors.dark,
    marginBottom: theme.spacing.s,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 6,
  },
  label: { color: theme.colors.gray, fontSize: theme.fontSize.medium },
  value: { color: theme.colors.dark, fontSize: theme.fontSize.medium },
  discount: { color: theme.colors.primary },
  totalRow: {
    borderTopWidth: 1,
    borderColor: theme.colors.grayLight,
    paddingTop: theme.spacing.s,
    marginTop: theme.spacing.s,
  },
  totalLabel: {
    fontSize: theme.fontSize.large,
    fontWeight: "bold",
    color: theme.colors.dark,
  },
  totalValue: {
    fontSize: theme.fontSize.large,
    fontWeight: "bold",
    color: theme.colors.primary,
  },
  couponRow: { flexDirection: "row", gap: 8 },
  input: {
    flex: 1,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.medium,
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.s,
    borderWidth: 1,
    borderColor: theme.colors.grayLight,
    marginBottom: theme.spacing.s,
  },
  applyBtn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.m,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.borderRadius.medium,
  },
  applyBtnText: { color: "#fff", fontWeight: "bold" },
  helperText: { color: theme.colors.gray, marginBottom: theme.spacing.s },
  errorText: {
    color: theme.colors.danger || "#cc0000",
    marginBottom: theme.spacing.s,
  },
  successText: { color: theme.colors.success || "#009966" },
  bankRow: { marginBottom: 8 },
  bankOption: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.medium,
    borderWidth: 1,
    borderColor: theme.colors.grayLight,
    padding: theme.spacing.m,
  },
  bankOptionActive: {
    borderColor: theme.colors.primary,
  },
  bankName: { fontWeight: "bold", color: theme.colors.dark, marginBottom: 4 },
  accountRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  accountNumber: { color: theme.colors.gray },
  copyBtn: { marginLeft: 8, paddingHorizontal: 8, paddingVertical: 4 },
  copyIcon: { fontSize: 16 },
  copiedText: { color: theme.colors.success || "#009966", marginTop: 4 },
});

export default PaymentScreen;
