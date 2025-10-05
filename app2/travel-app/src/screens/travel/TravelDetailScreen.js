import { useTranslation } from "react-i18next";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import theme from "../../config/theme";
import { isRTL } from "../../utils/rtl";

const TravelDetailScreen = ({ route, navigation }) => {
  const { t } = useTranslation();
  const { travel } = route.params;

  const handleBookNow = () => {
    navigation.navigate("Booking", { travel });
  };

  const handleViewComments = () => {
    navigation.navigate("Comments", { travel });
  };

  const handleViewDocuments = () => {
    navigation.navigate("DocumentViewer", { travel });
  };

  const statusColors = {
    PLANNED: theme.colors.primary,
    ONGOING: theme.colors.secondary,
    COMPLETED: theme.colors.gray,
    CANCELLED: theme.colors.danger,
  };

  const statusLabels = {
    PLANNED: t("upcoming"),
    ONGOING: t("active"),
    COMPLETED: t("completed"),
    CANCELLED: t("cancelled"),
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <Image source={{ uri: travel.image }} style={styles.headerImage} />

      <View style={styles.header}>
        <Text style={styles.title}>{travel.title}</Text>
        <View style={styles.statusBadge}>
          <View
            style={[
              styles.statusIndicator,
              { backgroundColor: statusColors[travel.status] },
            ]}
          />
          <Text style={styles.statusText}>{statusLabels[travel.status]}</Text>
        </View>
      </View>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Icon name="calendar" size={20} color={theme.colors.gray} />
          <Text style={styles.detailText}>
            {travel.startDate} - {travel.endDate}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Icon name="pricetag" size={20} color={theme.colors.gray} />
          <Text style={[styles.detailText, styles.priceText]}>
            ${travel.price}{" "}
            <Text style={styles.perPersonText}>{t("per_person")}</Text>
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Icon name="location" size={20} color={theme.colors.gray} />
          <Text style={styles.detailText}>{t("multiple_destinations")}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("description")}</Text>
        <Text style={styles.sectionContent}>{travel.description}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("itinerary")}</Text>
        <Text style={styles.sectionContent}>{travel.itinerary}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("requirements")}</Text>
        <Text style={styles.sectionContent}>{travel.requirements}</Text>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleViewComments}
        >
          <Icon
            name="chatbubble-ellipses"
            size={20}
            color={theme.colors.primary}
          />
          <Text style={styles.secondaryButtonText}>{t("view_comments")}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleViewDocuments}
        >
          <Icon name="document" size={20} color={theme.colors.primary} />
          <Text style={styles.secondaryButtonText}>{t("view_documents")}</Text>
        </TouchableOpacity>
      </View>

      <AppButton
        title={t("book_now")}
        onPress={handleBookNow}
        style={styles.bookButton}
        icon="arrow-forward"
      />
    </ScrollView>
  );
};

// AppButton component for consistency
const AppButton = ({ title, onPress, style, icon }) => {
  const isRtl = isRTL();

  return (
    <TouchableOpacity style={[styles.button, style]} onPress={onPress}>
      <Text style={styles.buttonText}>{title}</Text>
      {icon && (
        <Icon
          name={icon}
          size={20}
          color={theme.colors.white}
          style={isRtl ? { marginRight: 10 } : { marginLeft: 10 }}
        />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  contentContainer: {
    paddingBottom: theme.spacing.xl,
  },
  headerImage: {
    width: "100%",
    height: 250,
  },
  header: {
    padding: theme.spacing.m,
    flexDirection: isRTL ? "row-reverse" : "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: theme.colors.light,
  },
  title: {
    fontSize: theme.fontSize.xlarge,
    fontWeight: "bold",
    color: theme.colors.dark,
    flex: 1,
    ...(isRTL && { textAlign: "right" }),
  },
  statusBadge: {
    flexDirection: isRTL ? "row-reverse" : "row",
    alignItems: "center",
    backgroundColor: theme.colors.light,
    borderRadius: theme.borderRadius.medium,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.s,
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: isRTL ? 0 : theme.spacing.xs,
    marginLeft: isRTL ? theme.spacing.xs : 0,
  },
  statusText: {
    fontSize: theme.fontSize.small,
    fontWeight: "bold",
    ...(isRTL && { textAlign: "right" }),
  },
  details: {
    padding: theme.spacing.m,
  },
  detailRow: {
    flexDirection: isRTL ? "row-reverse" : "row",
    alignItems: "center",
    marginBottom: theme.spacing.s,
  },
  detailText: {
    fontSize: theme.fontSize.medium,
    color: theme.colors.dark,
    marginLeft: isRTL ? 0 : theme.spacing.s,
    marginRight: isRTL ? theme.spacing.s : 0,
    ...(isRTL && { textAlign: "right" }),
  },
  priceText: {
    color: theme.colors.primary,
    fontWeight: "bold",
  },
  perPersonText: {
    fontSize: theme.fontSize.small,
    color: theme.colors.gray,
    fontWeight: "normal",
  },
  section: {
    padding: theme.spacing.m,
    borderBottomWidth: 1,
    borderColor: theme.colors.light,
  },
  sectionTitle: {
    fontSize: theme.fontSize.large,
    fontWeight: "bold",
    color: theme.colors.dark,
    marginBottom: theme.spacing.s,
    ...(isRTL && { textAlign: "right" }),
  },
  sectionContent: {
    fontSize: theme.fontSize.medium,
    color: theme.colors.gray,
    lineHeight: 24,
    ...(isRTL && { textAlign: "right" }),
  },
  actionButtons: {
    flexDirection: isRTL ? "row-reverse" : "row",
    justifyContent: "space-between",
    padding: theme.spacing.m,
  },
  secondaryButton: {
    flexDirection: isRTL ? "row-reverse" : "row",
    alignItems: "center",
    padding: theme.spacing.s,
  },
  secondaryButtonText: {
    color: theme.colors.primary,
    fontWeight: "bold",
    marginLeft: isRTL ? 0 : theme.spacing.s,
    marginRight: isRTL ? theme.spacing.s : 0,
  },
  bookButton: {
    marginHorizontal: theme.spacing.m,
    marginTop: theme.spacing.s,
  },
  button: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.medium,
    flexDirection: isRTL ? "row-reverse" : "row",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: theme.colors.white,
    fontWeight: "bold",
    fontSize: theme.fontSize.medium,
  },
});

export default TravelDetailScreen;
