import AppButton from "@/src/components/common/AppButton";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { useLocalSearchParams, useRouter } from "expo-router";
import { t } from "i18next";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  Keyboard,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
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

const sampleComments = [
  {
    id: "1",
    userId: "user1",
    userName: "John Traveler",
    content:
      "This trip looks amazing! I've been dreaming of visiting Lalibela for years. Can you tell me more about the accommodation?",
    type: "PRE_TRAVEL",
    createdAt: "2024-01-15T14:30:00Z",
    userAvatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
    likes: 5,
    isLiked: false,
  },
  {
    id: "2",
    userId: "admin",
    userName: "Travel Support Team",
    content:
      "Hi John! The accommodation is at a beautiful 4-star hotel with stunning mountain views. All rooms have private bathrooms and hot water. Would you like more specific details?",
    type: "PRE_TRAVEL",
    createdAt: "2024-01-15T16:45:00Z",
    userAvatar:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150",
    likes: 3,
    isLiked: true,
  },
  {
    id: "3",
    userId: "user2",
    userName: "Sarah Adventure",
    content:
      "I took this trip last month and it was absolutely incredible! The rock-hewn churches are even more impressive in person. Our guide was very knowledgeable.",
    type: "POST_TRAVEL",
    createdAt: "2024-01-14T09:20:00Z",
    userAvatar:
      "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150",
    likes: 12,
    isLiked: true,
  },
];

export default function TravelDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const travel = travelData[id as TravelKey];
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>(sampleComments);
  const [newComment, setNewComment] = useState("");

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

  const handleSendComment = () => {
    if (newComment.trim() === "") return;

    const newCommentObj = {
      id: Date.now().toString(),
      userId: "currentUser",
      userName: "You",
      content: newComment,
      type: "PRE_TRAVEL",
      createdAt: new Date().toISOString(),
      likes: 0,
      isLiked: false,
    };

    setComments([...comments, newCommentObj]);
    setNewComment("");
    Keyboard.dismiss();
  };

  const formatDate = (dateString: any) => {
    const date = new Date(dateString);
    return format(date, "MMM dd, yyyy HH:mm", {
      // locale: i18n.language === "am" ? am : enUS,
    });
  };

  const renderComment = ({ item }: any) => (
    <View
      style={[
        styles.commentContainer,
        item.userId === "currentUser" ? styles.myComment : styles.otherComment,
      ]}
    >
      <View style={styles.commentHeader}>
        <View style={styles.userInfo}>
          {item.userAvatar ? (
            <Image source={{ uri: item.userAvatar }} style={styles.avatar} />
          ) : (
            <Image
              source={{
                uri: "https://static.vecteezy.com/system/resources/previews/047/733/682/non_2x/grey-avatar-icon-user-avatar-photo-icon-social-media-user-icon-vector.jpg",
              }}
              style={styles.avatar}
            />
          )}
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{item.userName}</Text>
            <Text style={styles.commentType}>
              {item.type === "POST_TRAVEL" ? "Past Traveler" : "Traveler"}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.likeButton}
          onPress={() => handleLike(item.id)}
        >
          <Ionicons
            name={item.isLiked ? "heart" : "heart-outline"}
            size={16}
            color={item.isLiked ? "#e53e3e" : "#718096"}
          />
          <Text style={[styles.likeCount, item.isLiked && styles.likedCount]}>
            {item.likes}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.commentText}>{item.content}</Text>

      <View style={styles.commentFooter}>
        <Text style={styles.commentDate}>{formatDate(item.createdAt)}</Text>
        {item.userId === "admin" && (
          <View style={styles.adminBadge}>
            <Ionicons name="shield-checkmark" size={12} color="#fff" />
            <Text style={styles.adminText}>Official</Text>
          </View>
        )}
      </View>
    </View>
  );

  const handleLike = (commentId: string) => {
    setComments((prevComments) =>
      prevComments.map((comment) =>
        comment.id === commentId
          ? {
              ...comment,
              isLiked: !comment.isLiked,
              likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
            }
          : comment
      )
    );
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
          <TouchableOpacity
            style={styles.commentButton}
            onPress={() => setShowComments(!showComments)}
          >
            <Ionicons name="chatbubble-outline" size={20} color="#667eea" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Ionicons name="share-outline" size={24} color="#1a202c" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{travel.title}</Text>
              {/* <Text style={styles.location}>
                <Ionicons name="location-outline" size={16} color="#718096" />
                {travel.location}
              </Text> */}
              <Text style={styles.duration}>{travel.duration}</Text>
            </View>
            {/* <View style={styles.ratingContainer}>
              <Ionicons name="star" size={20} color="#f6ad55" />
              <Text style={styles.rating}>{travel.rating}</Text>
              <Text style={styles.reviews}>
                ({travel.reviews} {t("reviews")})
              </Text>
            </View> */}
          </View>

          <View style={styles.priceContainer}>
            <Text style={styles.price}>
              {travel.price} {t("br")}
            </Text>
            <Text style={styles.perPerson}>{t("per_person")}</Text>
            {/* <Text style={styles.duration}>{travel.duration}</Text> */}
          </View>

          {!showComments && (
            <Text style={styles.description}>{travel.description}</Text>
          )}

          {!showComments && (
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
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color="#48bb78"
                    />
                    <Text style={styles.highlightText}>{highlight}</Text>
                  </View>
                )
              )}
            </View>
          )}

          {!showComments && (
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
          )}

          {!showComments && (
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
          )}
          {/* Full Comments Section */}
          {showComments && (
            <View style={styles.fullCommentsSection}>
              <View style={styles.commentsHeader}>
                <Text style={styles.sectionTitle}>
                  {t("comments")} ({comments.length})
                </Text>
                <TouchableOpacity onPress={() => setShowComments(false)}>
                  <Ionicons name="close" size={24} color="#718096" />
                </TouchableOpacity>
              </View>

              <FlatList
                data={comments}
                keyExtractor={(item) => item.id}
                renderItem={renderComment}
                contentContainerStyle={styles.commentsList}
                scrollEnabled={false}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>{t("no_comments")}</Text>
                    <Text style={styles.emptySubtext}>
                      {t("be_first_comment")}
                    </Text>
                  </View>
                }
              />

              {/* Comment Input */}
              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.input]}
                  placeholder={t("write_comment")}
                  value={newComment}
                  onChangeText={setNewComment}
                  multiline
                />
                <TouchableOpacity
                  style={styles.sendButton}
                  onPress={handleSendComment}
                  disabled={newComment.trim() === ""}
                >
                  <Text style={styles.sendButtonText}>{t("send")}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.priceFooter}>
          <Text style={styles.totalPrice}>
            {travel.price} {t("br")}
          </Text>
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
  // Comments Styles
  commentsPreview: {
    marginBottom: 32,
  },
  commentsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  viewAllText: {
    color: "#667eea",
    fontWeight: "600",
  },
  previewComments: {
    backgroundColor: "#f7fafc",
    borderRadius: 12,
    padding: 16,
  },
  previewComment: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  // previewComment: {
  //   marginBottom: 12,
  //   paddingBottom: 12,
  //   borderBottomWidth: 1,
  //   borderBottomColor: "#e2e8f0",
  // },
  previewUserName: {
    fontWeight: "bold",
    color: "#1a202c",
    marginBottom: 4,
  },
  previewCommentText: {
    color: "#4a5568",
    fontSize: 14,
  },
  noCommentsPreview: {
    backgroundColor: "#f7fafc",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
  },
  noCommentsText: {
    fontSize: 16,
    color: "#718096",
    marginBottom: 4,
  },
  beFirstText: {
    fontSize: 14,
    color: "#a0aec0",
  },
  fullCommentsSection: {
    marginBottom: 32,
    backgroundColor: "#f7fafc",
    borderRadius: 12,
    padding: 16,
  },
  commentsList: {
    minHeight: 100,
  },
  commentContainer: {
    maxWidth: "100%",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  myComment: {
    backgroundColor: "#ffffff",
    alignSelf: "flex-end",
    width: "90%",
  },
  otherComment: {
    backgroundColor: "#ffffff",
    alignSelf: "flex-start",
    width: "90%",
  },
  rtlComment: {
    alignSelf: "flex-end",
  },
  userName: {
    fontWeight: "bold",
    color: "#1a202c",
    marginBottom: 4,
  },
  commentText: {
    color: "#4a5568",
    marginBottom: 4,
  },
  commentDate: {
    fontSize: 12,
    color: "#718096",
  },
  emptyContainer: {
    padding: 24,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#718096",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#a0aec0",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderColor: "#e2e8f0",
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    padding: 12,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  rtlInput: {
    textAlign: "right",
  },
  sendButton: {
    marginLeft: 12,
    marginRight: 0,
    padding: 12,
  },
  sendButtonText: {
    color: "#667eea",
    fontWeight: "bold",
    fontSize: 16,
  },
  commentButton: {
    position: "absolute",
    top: 60,
    right: 74,
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
    // shadowOpacity: 0.1,
    // shadowRadius: 4,
    // elevation: 3,
  },
  // commentContainer: {
  //   maxWidth: "100%",
  //   padding: 16,
  //   borderRadius: 12,
  //   marginBottom: 16,
  //   backgroundColor: "#ffffff",
  //   shadowColor: "#000",
  //   shadowOffset: {
  //     width: 0,
  //     height: 1,
  //   },
  //   shadowOpacity: 0.1,
  //   shadowRadius: 3,
  //   elevation: 2,
  // },
  // myComment: {
  //   backgroundColor: "#ebf8ff",
  //   borderLeftWidth: 3,
  //   borderLeftColor: "#3182ce",
  // },
  // otherComment: {
  //   backgroundColor: "#ffffff",
  //   borderLeftWidth: 3,
  //   borderLeftColor: "#e2e8f0",
  // },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  // userName: {
  //   fontWeight: "bold",
  //   color: "#1a202c",
  //   fontSize: 16,
  //   marginBottom: 2,
  // },
  commentType: {
    fontSize: 12,
    color: "#718096",
  },
  likeButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 6,
    borderRadius: 6,
    backgroundColor: "#f7fafc",
  },
  likeCount: {
    fontSize: 12,
    color: "#718096",
    marginLeft: 4,
  },
  likedCount: {
    color: "#e53e3e",
    fontWeight: "600",
  },
  // commentText: {
  //   fontSize: 15,
  //   lineHeight: 22,
  //   color: "#2d3748",
  //   marginBottom: 12,
  // },
  commentFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  // commentDate: {
  //   fontSize: 12,
  //   color: "#a0aec0",
  // },
  adminBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#48bb78",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  adminText: {
    fontSize: 10,
    color: "#ffffff",
    fontWeight: "600",
    marginLeft: 4,
  },
});
