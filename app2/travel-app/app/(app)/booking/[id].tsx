import AppButton from "@/src/components/common/AppButton";
import { useAuth } from "@/src/context/AuthContext";
import { fetchTravel } from "@/src/services/travelService";
import { createBooking } from "@/src/services/bookingService";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  TextInput,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
// Payment is handled in My Bookings > Booking Detail

type Travel = { id: number; title: string; price: number };

export default function BookingScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { t } = useTranslation();
  const { user } = useAuth();

  const [travel, setTravel] = useState<Travel | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [travelers, setTravelers] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [participants, setParticipants] = useState<
    { name: string; age: string }[]
  >([{ name: "", age: "18" }]);
  // Payment is not handled here anymore

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetchTravel(id);
        setTravel(res?.data || null);
      } catch (e: any) {
        setError(e?.message || "Failed to load travel");
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  // Keep participants array length in sync with travelers count
  useEffect(() => {
    setParticipants((prev) => {
      const arr = [...prev];
      if (travelers > arr.length) {
        // add new default entries
        for (let i = arr.length; i < travelers; i++) {
          arr.push({ name: "", age: "18" });
        }
      } else if (travelers < arr.length) {
        arr.length = travelers;
      }
      return arr;
    });
  }, [travelers]);

  if (loading) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{t("loading")}...</Text>
      </View>
    );
  }

  if (error || !travel) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || t("travel_not_found")}</Text>
      </View>
    );
  }

  const totalPrice = (travel?.price || 0) * travelers;
  const tax = totalPrice * 0.1; // 10% tax
  const finalTotal = totalPrice + tax;

  const handleBooking = async () => {
    if (!user) {
      Alert.alert(t("authentication_required"), t("please_login_to_continue"));
      return;
    }

    setIsProcessing(true);

    try {
      // Build travelers payload; default names if empty
      const payloadTravelers = participants.map((p, idx) => ({
        name: p.name?.trim() || `${user?.name || "Traveler"} ${idx + 1}`,
        age: parseInt(p.age || "18", 10) || 18,
      }));

      const res = await createBooking({
        travelId: Number(travel.id),
        travelers: payloadTravelers,
      });
      setIsProcessing(false);
      if (res?.success && res?.data) {
        Alert.alert(
          t("booking_created") || "Booking Created",
          t("proceed_to_payment_instruction") ||
            "Please submit payment in My Bookings.",
          [
            {
              text: t("ok") || "OK",
              onPress: () => router.replace("/(app)/(tabs)/my-bookings"),
            },
          ]
        );
        // Also navigate immediately
        router.replace("/(app)/(tabs)/my-bookings");
      } else {
        Alert.alert(
          t("error") || "Error",
          t("failed_to_create_booking") || "Failed to create booking"
        );
      }
    } catch (e: any) {
      setIsProcessing(false);
      Alert.alert(
        t("error") || "Error",
        e.message || "Failed to create booking"
      );
    }
  };

  // Refresh and payment handling moved to My Bookings screens

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
          {/* Participants details */}
          {participants.map((p, idx) => (
            <View key={idx} style={styles.participantRow}>
              <View style={styles.participantField}>
                <Text style={styles.participantLabel}>{t("name")}</Text>
                <View style={styles.participantInputWrap}>
                  <Text style={styles.participantPrefix}>{idx + 1}.</Text>
                  <TextInput
                    placeholder={t("full_name")}
                    value={p.name}
                    onChangeText={(text) =>
                      setParticipants((prev) => {
                        const next = [...prev];
                        next[idx] = { ...next[idx], name: text };
                        return next;
                      })
                    }
                    style={styles.participantInput}
                  />
                </View>
              </View>
              <View style={[styles.participantField, { maxWidth: 100 }]}>
                <Text style={styles.participantLabel}>{t("age")}</Text>
                <TextInput
                  placeholder="18"
                  keyboardType="number-pad"
                  value={p.age}
                  onChangeText={(text) =>
                    setParticipants((prev) => {
                      const next = [...prev];
                      next[idx] = { ...next[idx], age: text };
                      return next;
                    })
                  }
                  style={styles.participantInput}
                />
              </View>
            </View>
          ))}
          <AppButton
            title={isProcessing ? t("processing") : t("confirm_booking")}
            onPress={handleBooking}
            disabled={isProcessing}
            loading={isProcessing}
            style={{ marginTop: 24 }}
            gradient={["#667eea", "#764ba2"]}
            icon="checkmark"
            textStyle={undefined}
          />
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

        {/* Payment moved to My Bookings detail */}

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
          disabled={isProcessing}
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
  // Participant form styles
  participantRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 12,
    marginTop: 16,
  },
  participantField: {
    flex: 1,
  },
  participantLabel: {
    fontSize: 12,
    color: "#718096",
    marginBottom: 4,
    fontWeight: "500",
  },
  participantInputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f7fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  participantPrefix: {
    fontSize: 14,
    color: "#4a5568",
    marginRight: 4,
    fontWeight: "600",
  },
  participantInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 6,
    color: "#2d3748",
  },
});
