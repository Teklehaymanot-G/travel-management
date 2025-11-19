import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import theme from "../../config/theme";
import Badge from "../ui/Badge";

const TicketCard = ({ ticket, onPress }) => {
  const statusColors = {
    CONFIRMED: theme.colors.secondary,
    PENDING: theme.colors.warning,
    CANCELLED: theme.colors.danger,
  };

  const statusLabels = {
    CONFIRMED: "Confirmed",
    PENDING: "Pending",
    CANCELLED: "Cancelled",
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.title}>Travel Ticket</Text>
        <Badge
          text={statusLabels[ticket.status]}
          color={statusColors[ticket.status]}
          style={styles.badge}
        />
      </View>

      <View style={styles.content}>
        <View style={styles.details}>
          <Text style={styles.name}>{ticket.name}</Text>
          <Text style={styles.age}>Age: {ticket.age}</Text>
          <Text style={styles.badgeNumber}>Badge: {ticket.badgeNumber}</Text>
        </View>

        {ticket.qrCodeUrl ? (
          <View style={styles.qrContainer}>
            <Image
              source={{ uri: ticket.qrCodeUrl }}
              style={{ width: 120, height: 120, borderRadius: 8 }}
              resizeMode="cover"
            />
          </View>
        ) : null}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Tap for details</Text>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.spacing.m,
    backgroundColor: theme.colors.primary,
  },
  title: {
    fontSize: theme.fontSize.medium,
    fontWeight: "bold",
    color: theme.colors.white,
  },
  badge: {
    backgroundColor: theme.colors.white,
  },
  content: {
    flexDirection: "row",
    padding: theme.spacing.m,
  },
  details: {
    flex: 1,
  },
  name: {
    fontSize: theme.fontSize.large,
    fontWeight: "bold",
    color: theme.colors.dark,
    marginBottom: theme.spacing.xs,
  },
  age: {
    fontSize: theme.fontSize.medium,
    color: theme.colors.gray,
    marginBottom: theme.spacing.xs,
  },
  badgeNumber: {
    fontSize: theme.fontSize.medium,
    color: theme.colors.dark,
    fontWeight: "500",
  },
  qrContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginLeft: theme.spacing.m,
  },
  footer: {
    padding: theme.spacing.m,
    borderTopWidth: 1,
    borderColor: theme.colors.light,
    alignItems: "center",
  },
  footerText: {
    fontSize: theme.fontSize.small,
    color: theme.colors.gray,
  },
});

export default TicketCard;
