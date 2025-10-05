import { useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import TravelCard from "../../components/travel/TravelCard";
import theme from "../../config/theme";
import { travels } from "../../services/mockData";

const TravelListScreen = ({ navigation }) => {
  const [activeFilter, setActiveFilter] = useState("all");

  const filters = [
    { id: "all", label: "All" },
    { id: "planned", label: "Upcoming" },
    { id: "ongoing", label: "Active" },
    { id: "completed", label: "Completed" },
  ];

  const filteredTravels =
    activeFilter === "all"
      ? travels
      : travels.filter((t) => t.status.toLowerCase() === activeFilter);

  const renderItem = ({ item }) => (
    <TravelCard
      travel={item}
      onPress={() => navigation.navigate("TravelDetail", { travel: item })}
    />
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Discover Your Next Adventure</Text>

      <FlatList
        horizontal
        data={filters}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.filterButton,
              activeFilter === item.id && styles.activeFilter,
            ]}
            onPress={() => setActiveFilter(item.id)}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === item.id && styles.activeFilterText,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.filterContainer}
        showsHorizontalScrollIndicator={false}
      />

      {filteredTravels.length > 0 ? (
        <FlatList
          data={filteredTravels}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          {/* <Image
            source={require("../../assets/images/no-travels.png")}
            style={styles.emptyImage}
          /> */}
          <Text style={styles.emptyText}>No travels found</Text>
          <Text style={styles.emptySubtext}>
            Try selecting a different filter
          </Text>
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
  filterContainer: {
    paddingBottom: theme.spacing.s,
  },
  filterButton: {
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.s,
    marginRight: theme.spacing.s,
    borderRadius: theme.borderRadius.large,
    backgroundColor: theme.colors.white,
  },
  activeFilter: {
    backgroundColor: theme.colors.primary,
  },
  filterText: {
    fontSize: theme.fontSize.medium,
    color: theme.colors.dark,
  },
  activeFilterText: {
    color: theme.colors.white,
    fontWeight: "bold",
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
  emptyImage: {
    width: 200,
    height: 200,
    marginBottom: theme.spacing.m,
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
  },
});

export default TravelListScreen;
