import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { getMyBookings } from "@/src/services/bookingService";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

export default function MyBookingsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getMyBookings({ page: 1, limit: 50 });
      setBookings(res?.data || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    load();
  }, [load]);

  // Reload whenever screen gains focus (ensures newly created bookings appear)
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await load();
    } finally {
      setRefreshing(false);
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const paymentStatus = item?.payment?.status;
    const isRejected = paymentStatus === "REJECTED";
    const isApproved = paymentStatus === "APPROVED";
    const isPending = paymentStatus === "PENDING";
    return (
      <TouchableOpacity
        style={[
          styles.card,
          isRejected && { borderColor: "#fc8181", backgroundColor: "#fff5f5" },
        ]}
        onPress={() => router.push(`/(app)/my-bookings/${item.id}`)}
        activeOpacity={0.85}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.title} numberOfLines={1}>
            {item?.travel?.title || t("travel")}
          </Text>
          <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
        <Text style={styles.subtitle}>
          {t("created_at")}: {new Date(item.createdAt).toLocaleDateString()} •{" "}
          {new Date(item.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
        <View
          style={{ flexDirection: "row", alignItems: "center", marginTop: 6 }}
        >
          <Ionicons
            name="card"
            size={14}
            color={
              isRejected
                ? "#e53e3e"
                : isApproved
                ? "#2f855a"
                : isPending
                ? "#d69e2e"
                : "#718096"
            }
          />
          <Text
            style={[
              styles.paymentStatus,
              isRejected && { color: "#e53e3e" },
              isApproved && { color: "#2f855a" },
              isPending && { color: "#d69e2e" },
            ]}
          >
            {t("payment")}: {paymentStatus || t("none")}
          </Text>
          {isRejected && (
            <View style={styles.rejectedTag}>
              <Ionicons name="close-circle" size={12} color="#fff" />
              <Text style={styles.rejectedTagText}>
                {t("rejected") || "Rejected"}
              </Text>
            </View>
          )}
          {isApproved && item?.tickets?.length > 0 && (
            <View style={styles.ticketsTag}>
              <Ionicons name="qr-code" size={12} color="#fff" />
              <Text style={styles.ticketsTagText}>{t("tickets")}</Text>
            </View>
          )}
        </View>
        <View style={styles.row}>
          <Ionicons name="people" size={16} color="#718096" />
          <Text style={styles.meta}>
            {Array.isArray(item.participants) ? item.participants.length : 1}{" "}
            {t("travelers")}
          </Text>
        </View>
        {isRejected && (
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => router.push(`/(app)/my-bookings/${item.id}`)}
          >
            <Ionicons name="refresh" size={16} color="#fff" />
            <Text style={styles.retryButtonText}>
              {t("retry_payment") || "Retry Payment"}
            </Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.screenHeader}>
        <Text style={styles.screenHeaderTitle}>
          {t("my_bookings") || "My Bookings"}
        </Text>
        <TouchableOpacity onPress={onRefresh} style={styles.screenHeaderAction}>
          <Ionicons name="refresh" size={18} color="#667eea" />
        </TouchableOpacity>
      </View>
      {(!bookings || bookings.length === 0) && !loading ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>
            {t("no_bookings_yet") || "No bookings yet."}
          </Text>
          <TouchableOpacity onPress={load} style={{ marginTop: 12 }}>
            <Text style={{ color: "#667eea", fontWeight: "600" }}>
              {t("refresh") || "Refresh"}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
}

function getStatusStyle(status: string) {
  switch (status) {
    case "APPROVED":
      return { backgroundColor: "#C6F6D5" };
    case "REJECTED":
      return { backgroundColor: "#FED7D7" };
    default:
      return { backgroundColor: "#FEEBC8" };
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  screenHeader: {
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    backgroundColor: "#ffffff",
  },
  screenHeaderTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1a202c",
  },
  screenHeaderAction: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f1f5f9",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#1a202c",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { fontSize: 16, fontWeight: "600", color: "#1a202c" },
  subtitle: { fontSize: 11, color: "#718096", marginTop: 6 },
  paymentStatus: { fontSize: 12, marginLeft: 6, fontWeight: "500" },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 12, fontWeight: "600", color: "#1a202c" },
  row: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  meta: { fontSize: 12, color: "#718096" },
  empty: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyText: { color: "#718096" },
  rejectedTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e53e3e",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  rejectedTagText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "600",
    marginLeft: 4,
  },
  ticketsTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2f855a",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  ticketsTagText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "600",
    marginLeft: 4,
  },
  retryButton: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#667eea",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 6,
  },
});
