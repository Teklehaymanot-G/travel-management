import AppButton from "@/src/components/common/AppButton";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { t } from "i18next";
import React from "react";
import {
  Image,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type TravelKey = keyof typeof travelData;

const travelData = {
  "1": {
    id: "1",
    title: "Lalibela Rock-Hewn Churches",
    location: "Lalibela, Ethiopia",
    price: 450,
    duration: "3 days",
    rating: 4.8,
    reviews: 1247,
    description:
      "Explore the magnificent rock-hewn churches of Lalibela, a UNESCO World Heritage site and one of the most important pilgrimage sites for Ethiopian Orthodox Christians.",
    images: [
      "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800",
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800",
    ],
    highlights: [
      "Visit 11 medieval monolithic cave churches",
      "Experience traditional Ethiopian Orthodox ceremonies",
      "Explore the underground tunnels and passages",
      "Enjoy panoramic views of the Lasta Mountains",
    ],
    included: [
      "Accommodation in 4-star hotel",
      "All transportation",
      "Professional guide",
      "Entrance fees",
      "Breakfast and dinner",
    ],
  },
  "2": {
    id: "2",
    title: "Danakil Depression Adventure",
    location: "Afar Region, Ethiopia",
    price: 680,
    duration: "4 days",
    rating: 4.9,
    reviews: 892,
    description:
      "Journey to one of the hottest places on Earth and witness the otherworldly landscapes of salt flats, volcanic formations, and colorful hydrothermal fields.",
    images: [
      "https://images.unsplash.com/photo-1559666126-84f389727b9a?w=800",
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800",
    ],
    highlights: [
      "Walk on the salt flats of Lake Asale",
      "See the active volcano Erta Ale",
      "Visit the colorful Dallol hydrothermal field",
      "Experience Afar culture and traditions",
    ],
    included: [
      "Camping equipment",
      "4WD transportation",
      "Experienced guide and scouts",
      "All meals included",
      "Safety equipment",
    ],
  },
};

export default function TravelDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const travel = travelData[id as TravelKey];

  if (!travel) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{t("travel_not_found")}</Text>
      </View>
    );
  }

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${travel.title} - ${travel.location}\n\n${travel.description}\n\nPrice: $${travel.price}`,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const handleBookNow = () => {
    router.push(`/booking/${travel.id}`);
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: travel.images[0] }}
            style={styles.mainImage}
            resizeMode="cover"
          />
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#1a202c" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Ionicons name="share-outline" size={24} color="#1a202c" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{travel.title}</Text>
              <Text style={styles.location}>
                <Ionicons name="location-outline" size={16} color="#718096" />
                {travel.location}
              </Text>
            </View>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={20} color="#f6ad55" />
              <Text style={styles.rating}>{travel.rating}</Text>
              <Text style={styles.reviews}>
                ({travel.reviews} {t("reviews")})
              </Text>
            </View>
          </View>

          <View style={styles.priceContainer}>
            <Text style={styles.price}>${travel.price}</Text>
            <Text style={styles.perPerson}>{t("per_person")}</Text>
            <Text style={styles.duration}>{travel.duration}</Text>
          </View>

          <Text style={styles.description}>{travel.description}</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("trip_highlights")}</Text>
            {travel.highlights.map(
              (
                highlight:
                  | string
                  | number
                  | bigint
                  | boolean
                  | React.ReactElement<
                      unknown,
                      string | React.JSXElementConstructor<any>
                    >
                  | Iterable<React.ReactNode>
                  | React.ReactPortal
                  | Promise<
                      | string
                      | number
                      | bigint
                      | boolean
                      | React.ReactPortal
                      | React.ReactElement<
                          unknown,
                          string | React.JSXElementConstructor<any>
                        >
                      | Iterable<React.ReactNode>
                      | null
                      | undefined
                    >
                  | null
                  | undefined,
                index: React.Key | null | undefined
              ) => (
                <View key={index} style={styles.highlightItem}>
                  <Ionicons name="checkmark-circle" size={20} color="#48bb78" />
                  <Text style={styles.highlightText}>{highlight}</Text>
                </View>
              )
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("whats_included")}</Text>
            {travel.included.map(
              (
                item:
                  | string
                  | number
                  | bigint
                  | boolean
                  | React.ReactElement<
                      unknown,
                      string | React.JSXElementConstructor<any>
                    >
                  | Iterable<React.ReactNode>
                  | React.ReactPortal
                  | Promise<
                      | string
                      | number
                      | bigint
                      | boolean
                      | React.ReactPortal
                      | React.ReactElement<
                          unknown,
                          string | React.JSXElementConstructor<any>
                        >
                      | Iterable<React.ReactNode>
                      | null
                      | undefined
                    >
                  | null
                  | undefined,
                index: React.Key | null | undefined
              ) => (
                <View key={index} style={styles.includedItem}>
                  <Ionicons name="checkmark" size={16} color="#667eea" />
                  <Text style={styles.includedText}>{item}</Text>
                </View>
              )
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("important_notes")}</Text>
            <View style={styles.noteItem}>
              <Ionicons
                name="information-circle-outline"
                size={20}
                color="#ed8936"
              />
              <Text style={styles.noteText}>
                {t("booking_confirmation_note")}
              </Text>
            </View>
            <View style={styles.noteItem}>
              <Ionicons
                name="information-circle-outline"
                size={20}
                color="#ed8936"
              />
              <Text style={styles.noteText}>
                {t("cancellation_policy_note")}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.priceFooter}>
          <Text style={styles.totalPrice}>${travel.price}</Text>
          <Text style={styles.totalLabel}>{t("total_per_person")}</Text>
        </View>
        <AppButton
          title={t("book_now")}
          onPress={handleBookNow}
          style={styles.bookButton}
          gradient={["#667eea", "#764ba2"]}
          icon="arrow-forward"
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
  imageContainer: {
    position: "relative",
  },
  mainImage: {
    width: "100%",
    height: 300,
  },
  backButton: {
    position: "absolute",
    top: 60,
    left: 24,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  shareButton: {
    position: "absolute",
    top: 60,
    right: 24,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    padding: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  titleContainer: {
    flex: 1,
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1a202c",
    marginBottom: 8,
  },
  location: {
    fontSize: 16,
    color: "#718096",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  rating: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a202c",
    marginLeft: 4,
    marginRight: 4,
  },
  reviews: {
    fontSize: 14,
    color: "#718096",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 24,
  },
  price: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#667eea",
    marginRight: 8,
  },
  perPerson: {
    fontSize: 14,
    color: "#718096",
    marginRight: 16,
  },
  duration: {
    fontSize: 14,
    color: "#718096",
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: "#4a5568",
    marginBottom: 32,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1a202c",
    marginBottom: 16,
  },
  highlightItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  highlightText: {
    fontSize: 16,
    color: "#4a5568",
    marginLeft: 12,
    flex: 1,
    lineHeight: 22,
  },
  includedItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  includedText: {
    fontSize: 16,
    color: "#4a5568",
    marginLeft: 12,
  },
  noteItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
    backgroundColor: "#fffaf0",
    padding: 12,
    borderRadius: 8,
  },
  noteText: {
    fontSize: 14,
    color: "#744210",
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
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
  priceFooter: {
    flex: 1,
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1a202c",
  },
  totalLabel: {
    fontSize: 14,
    color: "#718096",
  },
  bookButton: {
    flex: 1,
    marginLeft: 16,
  },
});
