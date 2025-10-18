import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
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

const travelDestinations = [
  {
    id: "1",
    title: "Lalibela Rock-Hewn Churches",
    location: "Lalibela, Ethiopia",
    price: 450,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=300",
    duration: "3 days",
  },
  {
    id: "2",
    title: "Danakil Depression Adventure",
    location: "Afar Region, Ethiopia",
    price: 680,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1559666126-84f389727b9a?w=300",
    duration: "4 days",
  },
  {
    id: "3",
    title: "Simien Mountains Trek",
    location: "Simien Mountains, Ethiopia",
    price: 520,
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300",
    duration: "5 days",
  },
  {
    id: "4",
    title: "Blue Nile Falls",
    location: "Bahir Dar, Ethiopia",
    price: 320,
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1560264280-88f9318fdead?w=300",
    duration: "2 days",
  },
  {
    id: "5",
    title: "Simien Mountains Trek",
    location: "Simien Mountains, Ethiopia",
    price: 520,
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300",
    duration: "5 days",
  },
  {
    id: "6",
    title: "Blue Nile Falls",
    location: "Bahir Dar, Ethiopia",
    price: 320,
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1560264280-88f9318fdead?w=300",
    duration: "2 days",
  },
];

export default function DiscoverScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  // const [selectedCategory, setSelectedCategory] = useState("all");

  // const categories = [
  //   { id: "all", name: t("all"), icon: "globe" },
  //   { id: "popular", name: t("popular"), icon: "flame" },
  //   { id: "adventure", name: t("adventure"), icon: "trail-sign" },
  //   { id: "cultural", name: t("cultural"), icon: "landmark" },
  // ];

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  };

  const handleTravelPress = (travelId: string) => {
    router.push(`/(app)/travel-detail/${travelId}`);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.greeting}>
            {t("discover_your_next_adventure")}
          </Text>
          <Text style={styles.subtitle}>
            {t("explore_amazing_destinations")}
          </Text>
        </View>
      </LinearGradient>

      {/* Categories */}
      {/* <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.category,
              selectedCategory === category.id && styles.categorySelected,
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <Ionicons
              name={category.icon}
              size={20}
              color={selectedCategory === category.id ? "#667eea" : "#718096"}
            />
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category.id && styles.categoryTextSelected,
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView> */}

      {/* Travel List */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.travelList}
      >
        <View style={styles.travelGrid}>
          {travelDestinations.map((travel) => (
            <TouchableOpacity
              key={travel.id}
              style={styles.travelCard}
              onPress={() => handleTravelPress(travel.id)}
            >
              <Image
                source={{ uri: travel.image }}
                style={styles.travelImage}
                resizeMode="cover"
              />
              <View style={styles.travelContent}>
                <Text style={styles.travelTitle}>{travel.title}</Text>
                {/* <Text style={styles.travelLocation}>
                  <Ionicons name="location-outline" size={14} color="#718096" />
                  {travel.location}
                </Text> */}

                <View style={styles.travelDetails}>
                  <View style={styles.travelDetail}>
                    <Ionicons name="time-outline" size={14} color="#718096" />
                    <Text style={styles.travelDetailText}>
                      {travel.duration}
                    </Text>
                  </View>
                  {/* <View style={styles.travelDetail}>
                    <Ionicons name="star" size={14} color="#f6ad55" />
                    <Text style={styles.travelDetailText}>{travel.rating}</Text>
                  </View> */}
                </View>

                <View style={styles.travelFooter}>
                  <Text style={styles.travelPrice}>
                    {travel.price} {t("br")}
                  </Text>
                  <Text style={styles.travelPriceLabel}>{t("per_person")}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
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
    paddingTop: 20,
    paddingBottom: 32,
  },
  headerContent: {
    marginTop: 20,
  },
  greeting: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
  },
  categoriesContainer: {
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  categoriesContent: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  category: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f7fafc",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  categorySelected: {
    backgroundColor: "#667eea",
    borderColor: "#667eea",
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#718096",
    marginLeft: 6,
  },
  categoryTextSelected: {
    color: "#ffffff",
  },
  scrollView: {
    flex: 1,
  },
  travelList: {
    padding: 16,
  },
  travelGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  travelCard: {
    width: "48%",
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
  travelImage: {
    width: "100%",
    height: 120,
  },
  travelContent: {
    padding: 12,
  },
  travelTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a202c",
    marginBottom: 4,
    lineHeight: 18,
  },
  travelLocation: {
    fontSize: 12,
    color: "#718096",
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  travelDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  travelDetail: {
    flexDirection: "row",
    alignItems: "center",
  },
  travelDetailText: {
    fontSize: 12,
    color: "#718096",
    marginLeft: 4,
  },
  travelFooter: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
  },
  travelPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#667eea",
  },
  travelPriceLabel: {
    fontSize: 10,
    color: "#718096",
  },
});
