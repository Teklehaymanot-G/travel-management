import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import theme from "../../config/theme";
import Badge from "../ui/Badge.js";

const TravelCard = ({ travel, onPress }) => {
  const statusColors = {
    PLANNED: theme.colors.primary,
    ONGOING: theme.colors.secondary,
    COMPLETED: theme.colors.gray,
    CANCELLED: theme.colors.danger,
  };

  const statusLabels = {
    PLANNED: "Upcoming",
    ONGOING: "Active",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image source={{ uri: travel.image }} style={styles.image} />

      <Badge
        text={statusLabels[travel.status]}
        color={statusColors[travel.status]}
        style={styles.badge}
      />

      <View style={styles.details}>
        <Text style={styles.title}>{travel.title}</Text>
        <Text style={styles.dates}>
          {travel.startDate} - {travel.endDate}
        </Text>

        <View style={styles.footer}>
          <Text style={styles.price}>${travel.price}</Text>
          <Text style={styles.perPerson}>per person</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.medium,
    overflow: "hidden",
    marginBottom: theme.spacing.m,
    elevation: 2,
    shadowColor: theme.colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: "100%",
    height: 180,
  },
  badge: {
    position: "absolute",
    top: theme.spacing.s,
    right: theme.spacing.s,
  },
  details: {
    padding: theme.spacing.m,
  },
  title: {
    fontSize: theme.fontSize.large,
    fontWeight: "bold",
    color: theme.colors.dark,
    marginBottom: theme.spacing.xs,
  },
  dates: {
    fontSize: theme.fontSize.medium,
    color: theme.colors.gray,
    marginBottom: theme.spacing.s,
  },
  footer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  price: {
    fontSize: theme.fontSize.xlarge,
    fontWeight: "bold",
    color: theme.colors.primary,
  },
  perPerson: {
    fontSize: theme.fontSize.small,
    color: theme.colors.gray,
    marginLeft: theme.spacing.xs,
  },
});

export default TravelCard;
