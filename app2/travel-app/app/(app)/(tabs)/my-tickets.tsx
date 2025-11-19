// import LoadingIndicator from "@/components/common/LoadingIndicator";
// import { useAuth } from "@/context/AuthContext";
import LoadingIndicator from "@/src/components/common/LoadingIndicator";
import { useAuth } from "@/src/context/AuthContext";
import { getMyBookings, cancelBooking } from "@/src/services/bookingService";
import { resolveImageUrl } from "@/src/utils/image";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Live data replaces static sample

export default function MyTicketsScreen() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("all"); // all | PENDING | APPROVED | REJECTED
  const [bookings, setBookings] = useState<any[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const load = async (status: string, isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      setError(null);
      const params: any = {};
      if (status !== "all") params.status = status;
      const res = await getMyBookings(params);
      setBookings(res?.data || []);
    } catch (e: any) {
      setError(e.message || "Failed to load bookings");
    } finally {
      if (!isRefresh) setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user) load(activeTab);
  }, [user, activeTab]);

  const onRefresh = () => {
    setRefreshing(true);
    load(activeTab, true);
  };

  const filteredBookings = bookings; // server already filtered by status

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "#48bb78";
      case "PENDING":
        return "#ed8936";
      case "REJECTED":
        return "#e53e3e";
      default:
        return "#a0aec0";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "APPROVED":
        return t("approved");
      case "PENDING":
        return t("pending");
      case "REJECTED":
        return t("rejected");
      default:
        return status;
    }
  };

  if (!user) {
    return (
      <LoadingIndicator
        text={t("loading_tickets")}
        color={undefined}
        style={undefined}
      />
    );
  }

  if (!user) {
    return (
      <LoadingIndicator
        text={t("loading_tickets")}
        color={undefined}
        style={undefined}
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t("my_tickets")}</Text>
        <Text style={styles.subtitle}>{t("manage_your_bookings")}</Text>
      </View>

      <View style={styles.tabContainer}>
        {["all", "PENDING", "APPROVED", "REJECTED"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]}
            >
              {t(tab.toLowerCase())}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.emptyState}>
            <Ionicons name="time-outline" size={48} color="#cbd5e0" />
            <Text style={styles.emptyStateText}>{t("loading")}</Text>
          </View>
        ) : error ? (
          <View style={styles.emptyState}>
            <Ionicons name="alert-circle-outline" size={48} color="#e53e3e" />
            <Text style={styles.emptyStateTitle}>{t("error")}</Text>
            <Text style={styles.emptyStateText}>{error}</Text>
          </View>
        ) : filteredBookings.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="ticket-outline" size={64} color="#cbd5e0" />
            <Text style={styles.emptyStateTitle}>{t("no_tickets_found")}</Text>
            <Text style={styles.emptyStateText}>
              {t("book_your_first_adventure")}
            </Text>
          </View>
        ) : (
          filteredBookings.map((b) => (
            <View key={b.id} style={styles.ticketCard}>
              <Image
                source={{ uri: resolveImageUrl(b?.travel?.imageUrl) || "" }}
                style={styles.ticketImage}
                resizeMode="cover"
              />
              <View style={styles.ticketContent}>
                <Text style={styles.ticketDestination}>{b.travel?.title}</Text>
                <View style={styles.ticketDetails}>
                  <View style={styles.ticketDetail}>
                    <Ionicons
                      name="calendar-outline"
                      size={16}
                      color="#718096"
                    />
                    <Text style={styles.ticketDetailText}>
                      {b.travel?.startDate
                        ? new Date(b.travel.startDate).toLocaleDateString()
                        : ""}
                      {b.travel?.endDate
                        ? ` - ${new Date(
                            b.travel.endDate
                          ).toLocaleDateString()}`
                        : ""}
                    </Text>
                  </View>
                  <View style={styles.ticketDetail}>
                    <Ionicons name="cash-outline" size={16} color="#718096" />
                    <Text style={styles.ticketDetailText}>
                      {b.travel?.price ? `${b.travel.price} ${t("br")}` : ""}
                    </Text>
                  </View>
                </View>
                <View style={styles.ticketFooter}>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(b.status) },
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {getStatusText(b.status)}
                    </Text>
                  </View>
                  {b.status === "PENDING" ? (
                    <TouchableOpacity
                      style={styles.viewButton}
                      onPress={async () => {
                        try {
                          await cancelBooking(b.id);
                          onRefresh();
                        } catch (e: any) {
                          alert(e.message || "Failed to cancel booking");
                        }
                      }}
                    >
                      <Text style={styles.viewButtonText}>{t("cancel")}</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={{ width: 100 }} />
                  )}
                </View>

                {(() => {
                  const count = Array.isArray(b.tickets) ? b.tickets.length : 0;
                  const isOpen = !!expanded[String(b.id)];
                  return (
                    <View style={{ marginTop: 12 }}>
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: 8,
                        }}
                      >
                        <Text style={{ fontWeight: "600", color: "#1a202c" }}>
                          {(t("tickets") || "Tickets") + ` (${count})`}
                        </Text>
                        {count > 0 ? (
                          <TouchableOpacity
                            onPress={() =>
                              setExpanded((prev) => ({
                                ...prev,
                                [String(b.id)]: !prev[String(b.id)],
                              }))
                            }
                            style={{
                              paddingHorizontal: 12,
                              paddingVertical: 6,
                              borderRadius: 8,
                              backgroundColor: isOpen ? "#e6fffa" : "#f7fafc",
                              borderWidth: 1,
                              borderColor: isOpen ? "#38b2ac" : "#e2e8f0",
                            }}
                          >
                            <Text
                              style={{
                                color: isOpen ? "#2c7a7b" : "#2b6cb0",
                                fontWeight: "600",
                              }}
                            >
                              {isOpen
                                ? t("hide") || "Hide"
                                : t("show") || "Show"}
                            </Text>
                          </TouchableOpacity>
                        ) : null}
                      </View>
                      {isOpen && count > 0
                        ? b.tickets.map((tk: any) => (
                            <View
                              key={tk.id}
                              style={{
                                borderWidth: 1,
                                borderColor: "#e2e8f0",
                                borderRadius: 8,
                                padding: 12,
                                marginBottom: 8,
                                backgroundColor: "#ffffff",
                              }}
                            >
                              <View
                                style={{
                                  flexDirection: "row",
                                  justifyContent: "space-between",
                                  marginBottom: 8,
                                }}
                              >
                                <Text
                                  style={{
                                    fontWeight: "600",
                                    color: "#2d3748",
                                  }}
                                >
                                  {tk.name}
                                </Text>
                                <Text style={{ color: "#718096" }}>
                                  {tk.ageGroup
                                    ? `Age ${tk.ageGroup}`
                                    : `Age ${tk.age ?? "-"}`}
                                </Text>
                              </View>
                              <Text
                                style={{ color: "#718096", marginBottom: 8 }}
                              >
                                Badge: {tk.badgeNumber}
                              </Text>
                              {tk.qrCodeUrl ? (
                                <Image
                                  source={{
                                    uri: resolveImageUrl(tk.qrCodeUrl) || "",
                                  }}
                                  style={{
                                    width: 160,
                                    height: 160,
                                    alignSelf: "center",
                                  }}
                                />
                              ) : null}
                            </View>
                          ))
                        : null}
                    </View>
                  );
                })()}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7fafc",
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: "#ffffff",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1a202c",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#718096",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  activeTab: {
    backgroundColor: "#667eea",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#718096",
  },
  activeTabText: {
    color: "#ffffff",
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4a5568",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#718096",
    textAlign: "center",
  },
  ticketCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: "hidden",
  },
  ticketImage: {
    width: "100%",
    height: 120,
  },
  ticketContent: {
    padding: 16,
  },
  ticketDestination: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a202c",
    marginBottom: 12,
  },
  ticketDetails: {
    flexDirection: "row",
    marginBottom: 12,
  },
  ticketDetail: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  ticketDetailText: {
    fontSize: 14,
    color: "#718096",
    marginLeft: 6,
  },
  ticketFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#ffffff",
  },
  viewButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#f7fafc",
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#667eea",
  },
});
