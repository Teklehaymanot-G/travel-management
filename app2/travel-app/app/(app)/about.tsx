import { useRouter } from "expo-router";
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

export default function AboutScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={22} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("about_app") || "About App"}</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.logoCircle}>
          <Ionicons name="bus-outline" size={36} color="#4f46e5" />
        </View>
        <Text style={styles.appName}>TravelEase</Text>
        <Text style={styles.versionLabel}>
          {t("version") || "Version"} v1.0.0
        </Text>
        <Text style={styles.description}>
          {t("about_description") ||
            "TravelEase helps you discover trips, book easily, and manage your tickets in one place."}
        </Text>
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
  content: { alignItems: "center", padding: 24 },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#eef2ff",
    alignItems: "center",
    justifyContent: "center",
  },
  appName: { fontSize: 22, fontWeight: "800", color: "#111827", marginTop: 12 },
  versionLabel: { color: "#6b7280", marginTop: 4 },
  description: {
    color: "#374151",
    textAlign: "center",
    marginTop: 16,
    lineHeight: 20,
  },
});
