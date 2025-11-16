import { useTranslation } from "react-i18next";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AppButton from "../../components/common/AppButton.js";
import { getMyBookings } from "../../services/bookingService";
import theme from "../../config/theme";
import { isRTL } from "../../utils/rtl";

const BookingConfirmationScreen = ({ route, navigation }) => {
  const { t } = useTranslation();
  const { travel, travelers } = route.params;
  const totalPrice = travel.price * travelers.length;
  const [loadingPaymentLookup, setLoadingPaymentLookup] = useState(false);
  const [lookupError, setLookupError] = useState("");

  const handleProceedToPayment = async () => {
    setLookupError("");
    setLoadingPaymentLookup(true);
    try {
      // Fetch user's bookings and find the latest pending booking without payment for this travel
      const res = await getMyBookings({ page: 1, limit: 20, status: "all" });
      const bookings = res?.data || [];
      const candidates = bookings.filter(
        (b) => b.travel?.id === travel.id && (!b.payment || b.payment === null)
      );
      // Sort by createdAt descending
      candidates.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      const booking = candidates[0];
      if (!booking) {
        setLookupError(
          t("no_bookings_yet") || "No pending booking found for this travel"
        );
      } else {
        navigation.navigate("Payment", { booking });
      }
    } catch (e) {
      setLookupError(e.message || "Failed to locate booking");
    } finally {
      setLoadingPaymentLookup(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.header}>
        {/* <Image
          source={require("../../assets/images/confirmation.png")}
          style={styles.image}
        /> */}
        <Text style={styles.title}>{t("booking_confirmed")}</Text>
        <Text style={styles.subtitle}>
          {t("confirmation_message", { title: travel.title })}
        </Text>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{t("booking_details")}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>{t("travel")}</Text>
          <Text style={styles.detailValue}>{travel.title}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>{t("dates")}</Text>
          <Text style={styles.detailValue}>
            {travel.startDate} - {travel.endDate}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>{t("travelers")}</Text>
          <Text style={styles.detailValue}>{travelers.length}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>{t("total_price")}</Text>
          <Text style={[styles.detailValue, styles.price]}>${totalPrice}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{t("travelers_list")}</Text>
        </View>

        {travelers.map((traveler, index) => (
          <View key={index} style={styles.travelerItem}>
            <Text style={styles.travelerName}>{traveler.name}</Text>
            <Text style={styles.travelerAge}>
              {t("age")}: {traveler.age}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.actions}>
        <AppButton
          title={t("view_tickets")}
          onPress={() => navigation.navigate("MyTickets")}
          style={styles.button}
        />
        <AppButton
          title={t("continue_payment") || "Continue to Payment"}
          onPress={handleProceedToPayment}
          style={styles.button}
          disabled={loadingPaymentLookup}
        />
        {lookupError ? (
          <Text style={styles.errorText}>{lookupError}</Text>
        ) : null}
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate("TravelDetail", { travel })}
        >
          <Text style={styles.secondaryButtonText}>
            {t("view_travel_details")}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  contentContainer: {
    padding: theme.spacing.m,
  },
  header: {
    alignItems: "center",
    marginBottom: theme.spacing.xl,
  },
  image: {
    width: 150,
    height: 150,
    marginBottom: theme.spacing.m,
  },
  title: {
    fontSize: theme.fontSize.xxlarge,
    fontWeight: "bold",
    color: theme.colors.primary,
    textAlign: "center",
    marginBottom: theme.spacing.s,
  },
  subtitle: {
    fontSize: theme.fontSize.large,
    color: theme.colors.gray,
    textAlign: "center",
  },
  card: {
    backgroundColor: theme.colors.light,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.m,
  },
  cardHeader: {
    borderBottomWidth: 1,
    borderColor: theme.colors.grayLight,
    paddingBottom: theme.spacing.s,
    marginBottom: theme.spacing.s,
  },
  cardTitle: {
    fontSize: theme.fontSize.large,
    fontWeight: "bold",
    color: theme.colors.dark,
    ...(isRTL && { textAlign: "right" }),
  },
  detailRow: {
    flexDirection: isRTL ? "row-reverse" : "row",
    justifyContent: "space-between",
    marginBottom: theme.spacing.s,
  },
  detailLabel: {
    fontSize: theme.fontSize.medium,
    color: theme.colors.gray,
    ...(isRTL && { textAlign: "right" }),
  },
  detailValue: {
    fontSize: theme.fontSize.medium,
    color: theme.colors.dark,
    fontWeight: "500",
    ...(isRTL && { textAlign: "right" }),
  },
  price: {
    color: theme.colors.primary,
    fontWeight: "bold",
  },
  travelerItem: {
    paddingVertical: theme.spacing.s,
    borderBottomWidth: 1,
    borderColor: theme.colors.grayLight,
    ...(isRTL && { alignItems: "flex-end" }),
  },
  travelerName: {
    fontSize: theme.fontSize.medium,
    color: theme.colors.dark,
    fontWeight: "500",
    marginBottom: theme.spacing.xs,
    ...(isRTL && { textAlign: "right" }),
  },
  travelerAge: {
    fontSize: theme.fontSize.medium,
    color: theme.colors.gray,
    ...(isRTL && { textAlign: "right" }),
  },
  actions: {
    marginTop: theme.spacing.s,
  },
  button: {
    marginBottom: theme.spacing.m,
  },
  secondaryButton: {
    alignItems: "center",
    padding: theme.spacing.m,
  },
  secondaryButtonText: {
    color: theme.colors.primary,
    fontSize: theme.fontSize.medium,
    fontWeight: "bold",
  },
  errorText: {
    color: theme.colors.danger || "#cc0000",
    marginTop: theme.spacing.s,
    textAlign: "center",
  },
});

export default BookingConfirmationScreen;
