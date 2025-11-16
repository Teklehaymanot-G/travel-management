import { useRouter } from "expo-router";
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

export default function HelpSupportScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const email = "support@example.com";
  const phone = "+000000000";
  const whatsapp = "+000000000";

  const openWhatsApp = () => {
    const url = Platform.select({
      ios: `whatsapp://send?phone=${whatsapp}`,
      android: `whatsapp://send?phone=${whatsapp}`,
      default: `https://wa.me/${whatsapp.replace(/[^\d]/g, "")}`,
    });
    if (url) Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={22} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {t("help_support") || "Help & Support"}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>{t("need_help") || "Need help?"}</Text>
        <Text style={styles.subtitle}>
          {t("contact_support") || "Contact Support"}
        </Text>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => Linking.openURL(`mailto:${email}`)}
          >
            <Ionicons name="mail-outline" size={18} color="#4f46e5" />
            <Text style={styles.actionText}>{t("email_us") || "Email"}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => Linking.openURL(`tel:${phone}`)}
          >
            <Ionicons name="call-outline" size={18} color="#4f46e5" />
            <Text style={styles.actionText}>{t("call_us") || "Call"}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={openWhatsApp}>
            <Ionicons name="logo-whatsapp" size={18} color="#22c55e" />
            <Text style={styles.actionText}>{t("whatsapp") || "WhatsApp"}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>FAQ</Text>
        <View style={styles.faqItem}>
          <Text style={styles.faqQ}>How do I submit payment?</Text>
          <Text style={styles.faqA}>
            Go to a booking and tap Continue to Payment, then upload your
            receipt.
          </Text>
        </View>
        <View style={styles.faqItem}>
          <Text style={styles.faqQ}>When do I get tickets?</Text>
          <Text style={styles.faqA}>
            After your payment is approved, tickets with QR codes are generated
            automatically.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 56,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f4f6",
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#111827" },
  section: {
    backgroundColor: "#fff",
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  title: { fontSize: 18, fontWeight: "700", color: "#111827" },
  subtitle: { marginTop: 6, color: "#6b7280" },
  actions: { flexDirection: "row", marginTop: 14, gap: 10 },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#c7d2fe",
    backgroundColor: "#eef2ff",
  },
  actionText: { marginLeft: 8, color: "#4338ca", fontWeight: "600" },
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  faqItem: { marginBottom: 10 },
  faqQ: { fontWeight: "700", color: "#111827", marginBottom: 4 },
  faqA: { color: "#6b7280" },
});
