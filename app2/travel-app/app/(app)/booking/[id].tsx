// import AppButton from "@/components/common/AppButton";
// import { useAuth } from "@/context/AuthContext";
import AppButton from "@/src/components/common/AppButton";
import { useAuth } from "@/src/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Travel = { id: string; title: string; price: number };
const travelData: { [key: string]: Travel } = {
  "1": {
    id: "1",
    title: "Lalibela Rock-Hewn Churches",
    price: 450,
  },
  "2": {
    id: "2",
    title: "Danakil Depression Adventure",
    price: 680,
  },
};

export default function BookingScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { t } = useTranslation();
  const { user } = useAuth();

  const travel = travelData[id as string];
  const [travelers, setTravelers] = useState(1);
  const [selectedDate, setSelectedDate] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  if (!travel) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{t("travel_not_found")}</Text>
      </View>
    );
  }

  const totalPrice = travel.price * travelers;
  const tax = totalPrice * 0.1; // 10% tax
  const finalTotal = totalPrice + tax;

  const handleBooking = async () => {
    if (!selectedDate) {
      Alert.alert(t("select_date"), t("please_select_travel_date"));
      return;
    }

    if (!user) {
      Alert.alert(t("authentication_required"), t("please_login_to_continue"));
      return;
    }

    setIsProcessing(true);

    // Simulate booking process
    setTimeout(() => {
      setIsProcessing(false);
      Alert.alert(t("booking_successful"), t("your_trip_has_been_booked"), [
        {
          text: t("view_tickets"),
          onPress: () => router.replace("/(app)/(tabs)/my-tickets"),
        },
      ]);
    }, 3000);
  };

  const incrementTravelers = () => {
    if (travelers < 10) {
      setTravelers(travelers + 1);
    }
  };

  const decrementTravelers = () => {
    if (travelers > 1) {
      setTravelers(travelers - 1);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#1a202c" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t("book_trip")}</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.tripInfo}>
          <Text style={styles.tripTitle}>{travel.title}</Text>
          <Text style={styles.basePrice}>
            ${travel.price} {t("per_person")}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("number_of_travelers")}</Text>
          <View style={styles.travelerSelector}>
            <TouchableOpacity
              style={styles.selectorButton}
              onPress={decrementTravelers}
              disabled={travelers <= 1}
            >
              <Ionicons
                name="remove"
                size={24}
                color={travelers <= 1 ? "#cbd5e0" : "#667eea"}
              />
            </TouchableOpacity>

            <View style={styles.travelerCount}>
              <Text style={styles.travelerNumber}>{travelers}</Text>
              <Text style={styles.travelerLabel}>
                {travelers === 1 ? t("traveler") : t("travelers")}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.selectorButton}
              onPress={incrementTravelers}
              disabled={travelers >= 10}
            >
              <Ionicons
                name="add"
                size={24}
                color={travelers >= 10 ? "#cbd5e0" : "#667eea"}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("select_travel_date")}</Text>
          <View style={styles.dateOptions}>
            {["2024-02-15", "2024-02-22", "2024-03-01", "2024-03-08"].map(
              (date) => (
                <TouchableOpacity
                  key={date}
                  style={[
                    styles.dateOption,
                    selectedDate === date && styles.selectedDateOption,
                  ]}
                  onPress={() => setSelectedDate(date)}
                >
                  <Text
                    style={[
                      styles.dateText,
                      selectedDate === date && styles.selectedDateText,
                    ]}
                  >
                    {new Date(date).toLocaleDateString()}
                  </Text>
                </TouchableOpacity>
              )
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("price_summary")}</Text>
          <View style={styles.priceBreakdown}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>
                {travel.price} × {travelers} {t("travelers")}
              </Text>
              <Text style={styles.priceValue}>${totalPrice}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>{t("taxes_fees")}</Text>
              <Text style={styles.priceValue}>${tax.toFixed(2)}</Text>
            </View>
            <View style={[styles.priceRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>{t("total")}</Text>
              <Text style={styles.totalValue}>${finalTotal.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("payment_method")}</Text>
          <TouchableOpacity style={styles.paymentMethod}>
            <View style={styles.paymentLeft}>
              <Ionicons name="card-outline" size={24} color="#4a5568" />
              <Text style={styles.paymentText}>{t("credit_debit_card")}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#cbd5e0" />
          </TouchableOpacity>
        </View>

        <View style={styles.termsContainer}>
          <Text style={styles.termsText}>
            {t("by_continuing_you_agree_terms")}
          </Text>
          <TouchableOpacity>
            <Text style={styles.termsLink}>{t("terms_of_service")}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerPrice}>
          <Text style={styles.footerTotal}>${finalTotal.toFixed(2)}</Text>
          <Text style={styles.footerLabel}>{t("total")}</Text>
        </View>
        <AppButton
          title={isProcessing ? t("processing") : t("confirm_booking")}
          onPress={handleBooking}
          disabled={isProcessing || !selectedDate}
          loading={isProcessing}
          style={styles.bookButton}
          gradient={["#667eea", "#764ba2"]}
          icon="checkmark"
          textStyle={undefined}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    color: "#718096",
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
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
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a202c",
  },
  placeholder: {
    width: 40,
  },
  tripInfo: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  tripTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1a202c",
    marginBottom: 8,
  },
  basePrice: {
    fontSize: 16,
    color: "#667eea",
    fontWeight: "500",
  },
  section: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a202c",
    marginBottom: 16,
  },
  travelerSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f7fafc",
    borderRadius: 12,
    padding: 16,
  },
  selectorButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  travelerCount: {
    alignItems: "center",
  },
  travelerNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1a202c",
  },
  travelerLabel: {
    fontSize: 14,
    color: "#718096",
    marginTop: 4,
  },
  dateOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  dateOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#f7fafc",
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedDateOption: {
    backgroundColor: "#667eea",
    borderColor: "#667eea",
  },
  dateText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4a5568",
  },
  selectedDateText: {
    color: "#ffffff",
  },
  priceBreakdown: {
    backgroundColor: "#f7fafc",
    borderRadius: 12,
    padding: 16,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 12,
    marginBottom: 0,
  },
  priceLabel: {
    fontSize: 16,
    color: "#4a5568",
  },
  priceValue: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1a202c",
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a202c",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#667eea",
  },
  paymentMethod: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f7fafc",
    borderRadius: 12,
    padding: 16,
  },
  paymentLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  paymentText: {
    fontSize: 16,
    color: "#4a5568",
    marginLeft: 12,
  },
  termsContainer: {
    padding: 24,
    alignItems: "center",
  },
  termsText: {
    fontSize: 14,
    color: "#718096",
    textAlign: "center",
    marginBottom: 8,
  },
  termsLink: {
    fontSize: 14,
    color: "#667eea",
    fontWeight: "500",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  footerPrice: {
    flex: 1,
  },
  footerTotal: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1a202c",
  },
  footerLabel: {
    fontSize: 14,
    color: "#718096",
  },
  bookButton: {
    flex: 1,
    marginLeft: 16,
  },
});
