// import LoadingIndicator from "@/components/common/LoadingIndicator";
// import { useAuth } from "@/context/AuthContext";
import LoadingIndicator from "@/src/components/common/LoadingIndicator";
import { useAuth } from "@/src/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
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

const tickets = [
  {
    id: "1",
    destination: "Lalibela, Ethiopia",
    date: "2024-02-15",
    price: "$450",
    status: "confirmed",
    image: "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=300",
  },
  {
    id: "2",
    destination: "Danakil Depression",
    date: "2024-03-20",
    price: "$680",
    status: "upcoming",
    image: "https://images.unsplash.com/photo-1559666126-84f389727b9a?w=300",
  },
  {
    id: "3",
    destination: "Simien Mountains",
    date: "2024-01-10",
    price: "$520",
    status: "completed",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300",
  },
];

export default function MyTicketsScreen() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  };

  const filteredTickets = tickets.filter((ticket) => {
    if (activeTab === "all") return true;
    return ticket.status === activeTab;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "#48bb78";
      case "upcoming":
        return "#ed8936";
      case "completed":
        return "#4299e1";
      default:
        return "#a0aec0";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "confirmed":
        return t("confirmed");
      case "upcoming":
        return t("upcoming");
      case "completed":
        return t("completed");
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t("my_tickets")}</Text>
        <Text style={styles.subtitle}>{t("manage_your_bookings")}</Text>
      </View>

      <View style={styles.tabContainer}>
        {["all", "upcoming", "confirmed", "completed"].map((tab) => (
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
              {t(tab)}
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
        {filteredTickets.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="ticket-outline" size={64} color="#cbd5e0" />
            <Text style={styles.emptyStateTitle}>{t("no_tickets_found")}</Text>
            <Text style={styles.emptyStateText}>
              {t("book_your_first_adventure")}
            </Text>
          </View>
        ) : (
          filteredTickets.map((ticket) => (
            <TouchableOpacity key={ticket.id} style={styles.ticketCard}>
              <Image
                source={{ uri: ticket.image }}
                style={styles.ticketImage}
                resizeMode="cover"
              />
              <View style={styles.ticketContent}>
                <Text style={styles.ticketDestination}>
                  {ticket.destination}
                </Text>
                <View style={styles.ticketDetails}>
                  <View style={styles.ticketDetail}>
                    <Ionicons
                      name="calendar-outline"
                      size={16}
                      color="#718096"
                    />
                    <Text style={styles.ticketDetailText}>{ticket.date}</Text>
                  </View>
                  <View style={styles.ticketDetail}>
                    <Ionicons name="cash-outline" size={16} color="#718096" />
                    <Text style={styles.ticketDetailText}>{ticket.price}</Text>
                  </View>
                </View>
                <View style={styles.ticketFooter}>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(ticket.status) },
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {getStatusText(ticket.status)}
                    </Text>
                  </View>
                  <TouchableOpacity style={styles.viewButton}>
                    <Text style={styles.viewButtonText}>
                      {t("view_details")}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
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
