import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import TicketCard from "../../components/booking/TicketCard";
import theme from "../../config/theme";
import { bookings } from "../../services/mockData";

const MyTicketsScreen = ({ navigation }) => {
  const groupedTickets = bookings.flatMap((booking) =>
    booking.tickets.map((ticket) => ({
      ...ticket,
      bookingId: booking.id,
      travelId: booking.travelId,
      status: booking.status,
    }))
  );

  const renderItem = ({ item }) => (
    <TicketCard
      ticket={item}
      onPress={() => navigation.navigate("TicketDetail", { ticket: item })}
    />
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Tickets</Text>

      {groupedTickets.length > 0 ? (
        <FlatList
          data={groupedTickets}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No tickets yet</Text>
          <Text style={styles.emptySubtext}>
            Book your first adventure to get started
          </Text>
          <TouchableOpacity style={styles.exploreButton}>
            <Text style={styles.exploreButtonText}>Explore Travels</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.light,
    padding: theme.spacing.m,
  },
  header: {
    fontSize: theme.fontSize.xlarge,
    fontWeight: "bold",
    color: theme.colors.dark,
    marginBottom: theme.spacing.m,
  },
  listContent: {
    paddingBottom: theme.spacing.xl,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.xl,
  },
  emptyText: {
    fontSize: theme.fontSize.xlarge,
    fontWeight: "bold",
    color: theme.colors.dark,
    marginBottom: theme.spacing.s,
  },
  emptySubtext: {
    fontSize: theme.fontSize.medium,
    color: theme.colors.gray,
    textAlign: "center",
    marginBottom: theme.spacing.m,
  },
  exploreButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.m,
    paddingHorizontal: theme.spacing.l,
    borderRadius: theme.borderRadius.medium,
  },
  exploreButtonText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.medium,
    fontWeight: "bold",
  },
});

export default MyTicketsScreen;
