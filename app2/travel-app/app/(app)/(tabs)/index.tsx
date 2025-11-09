import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { fetchTravels } from "@/src/services/travelService";
import { resolveImageUrl } from "@/src/utils/image";

const PLACEHOLDER =
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=600";

export default function DiscoverScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [travels, setTravels] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);
  // const [selectedCategory, setSelectedCategory] = useState("all");

  // const categories = [
  //   { id: "all", name: t("all"), icon: "globe" },
  //   { id: "popular", name: t("popular"), icon: "flame" },
  //   { id: "adventure", name: t("adventure"), icon: "trail-sign" },
  //   { id: "cultural", name: t("cultural"), icon: "landmark" },
  // ];

  const loadTravels = async (reset = false) => {
    try {
      if (reset) {
        setPage(1);
      }
      setError(null);
      if (reset) setLoading(true);
      // Fetch ONGOING and COMPLETED only
      const currentPage = reset ? 1 : page;
      const [ongoingRes, completedRes] = await Promise.all([
        fetchTravels({ page: currentPage, limit: 10, status: "ONGOING" }),
        fetchTravels({ page: currentPage, limit: 10, status: "COMPLETED" }),
      ]);

      const items = [
        ...(ongoingRes?.data || []),
        ...(completedRes?.data || []),
      ];
      // Sort combined by createdAt desc if present, else by startDate desc
      items.sort((a: any, b: any) => {
        const aDate = a.createdAt || a.startDate || 0;
        const bDate = b.createdAt || b.startDate || 0;
        return new Date(bDate).getTime() - new Date(aDate).getTime();
      });

      const totalPages = Math.max(
        ongoingRes?.pagination?.pages || 1,
        completedRes?.pagination?.pages || 1
      );
      setTravels((prev) => (reset ? items : [...prev, ...items]));
      setHasMore(currentPage < totalPages);
    } catch (e: any) {
      setError(e?.message || "Failed to load travels");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadTravels(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (page > 1) {
      loadTravels(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const onRefresh = () => {
    setRefreshing(true);
    loadTravels(true);
  };

  const handleTravelPress = (travelId: string | number) => {
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
        {loading && travels.length === 0 ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color="#667eea" />
          </View>
        ) : null}
        {error && !loading ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryBtn}
              onPress={() => loadTravels(true)}
            >
              <Text style={styles.retryText}>{t("retry")}</Text>
            </TouchableOpacity>
          </View>
        ) : null}
        {!loading && !error && travels.length === 0 ? (
          <View style={styles.emptyWrap}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="airplane-outline" size={36} color="#667eea" />
            </View>
            <Text style={styles.emptyTitle}>
              {t("no_travels_title", { defaultValue: "No trips yet" })}
            </Text>
            <Text style={styles.emptyText}>
              {t("no_travels_message", {
                defaultValue:
                  "New adventures will appear here. Try refreshing or check back later.",
              })}
            </Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={onRefresh}>
              <Text style={styles.emptyBtnText}>
                {t("refresh", { defaultValue: "Refresh" })}
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}
        <View style={styles.travelGrid}>
          {travels.map((travel) => (
            <TouchableOpacity
              key={String(travel.id)}
              style={styles.travelCard}
              onPress={() => handleTravelPress(travel.id)}
            >
              <Image
                source={{
                  uri: resolveImageUrl(travel.imageUrl) || PLACEHOLDER,
                }}
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
                      {travel.startDate && travel.endDate
                        ? `${new Date(
                            travel.startDate
                          ).toLocaleDateString()} - ${new Date(
                            travel.endDate
                          ).toLocaleDateString()}`
                        : t("planned")}
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
        {!loading && hasMore && (
          <TouchableOpacity
            style={styles.loadMoreBtn}
            onPress={() => setPage((p) => p + 1)}
          >
            <Text style={styles.loadMoreText}>{t("load_more")}</Text>
          </TouchableOpacity>
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
  loadingWrap: {
    paddingVertical: 40,
    alignItems: "center",
  },
  errorBox: {
    backgroundColor: "#fff5f5",
    borderColor: "#fed7d7",
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  errorText: {
    color: "#c53030",
    fontSize: 14,
  },
  retryBtn: {
    marginTop: 8,
    paddingVertical: 8,
  },
  retryText: {
    color: "#667eea",
    fontWeight: "600",
  },
  travelGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  emptyWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    gap: 8,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#eef2ff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a202c",
    marginTop: 4,
  },
  emptyText: {
    fontSize: 14,
    color: "#4a5568",
    textAlign: "center",
    paddingHorizontal: 16,
    marginTop: 2,
  },
  emptyBtn: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#667eea",
    borderRadius: 10,
  },
  emptyBtnText: {
    color: "#ffffff",
    fontWeight: "600",
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
  loadMoreBtn: {
    marginTop: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  loadMoreText: {
    color: "#667eea",
    fontWeight: "600",
  },
});
