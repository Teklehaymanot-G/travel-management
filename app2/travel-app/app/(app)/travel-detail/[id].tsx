import AppButton from "@/src/components/common/AppButton";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { useLocalSearchParams, useRouter } from "expo-router";
import { t } from "i18next";
import React, { useEffect, useState, useCallback } from "react";
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
  Platform,
  KeyboardAvoidingView,
  Alert,
} from "react-native";
import { fetchTravel } from "@/src/services/travelService";
import {
  fetchComments,
  createComment,
  likeComment,
  unlikeComment,
  deleteComment,
} from "@/src/services/commentService";
import { resolveImageUrl } from "@/src/utils/image";
import { useAuth } from "@/src/context/AuthContext";

const PLACEHOLDER =
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200";

// Comments now loaded from backend. Sample removed.

export default function TravelDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [travel, setTravel] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [commentsLoading, setCommentsLoading] = useState<boolean>(false);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const { user } = useAuth();

  // Pagination state
  const [commentPage, setCommentPage] = useState(1);
  const [commentLimit] = useState(20);
  const [commentHasMore, setCommentHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setError(null);
        setLoading(true);
        const res = await fetchTravel(id);
        setTravel(res?.data || null);
      } catch (e: any) {
        setError(e?.message || "Failed to load travel");
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  // Map API comment to view model
  const mapComment = useCallback(
    (c: any) => ({
      id: String(c.id),
      userId: String(c.traveler?.id || c.travelerId || ""),
      userName: c.traveler?.name || c.traveler?.phone || "Traveler",
      content: c.content,
      type: c.type,
      createdAt: c.createdAt,
      userAvatar: c.traveler?.avatarUrl
        ? resolveImageUrl(c.traveler.avatarUrl)
        : null,
      likes: c.likesCount || 0,
      isLiked: !!c.likedByMe,
    }),
    []
  );

  const loadComments = useCallback(
    async (pageToLoad = 1, append = false) => {
      if (!id) return;
      try {
        if (!append) setCommentError(null);
        if (!append) setCommentsLoading(true);
        else setLoadingMore(true);
        const res = await fetchComments(id as string, {
          page: pageToLoad,
          limit: commentLimit,
        });
        const mapped = (res.data || []).map(mapComment);
        setComments((prev) => (append ? [...prev, ...mapped] : mapped));
        const pages = res.pagination?.pages || 1;
        setCommentHasMore(pageToLoad < pages);
        setCommentPage(pageToLoad);
      } catch (e: any) {
        setCommentError(e.message || "Failed to load comments");
      } finally {
        if (!append) setCommentsLoading(false);
        else setLoadingMore(false);
      }
    },
    [id, commentLimit, mapComment]
  );

  // Initial comments load / reset when toggling visibility
  useEffect(() => {
    if (showComments) {
      setCommentPage(1);
      loadComments(1, false);
    }
  }, [showComments, loadComments]);

  const handleLoadMore = () => {
    if (loadingMore || !commentHasMore) return;
    loadComments(commentPage + 1, true);
  };

  if (loading) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{t("loading")}...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

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
    if (!user) {
      Alert.alert(
        t("authentication_required") || "Login Required",
        t("please_login_to_continue") || "Please login to continue",
        [
          { text: t("cancel") || "Cancel", style: "cancel" },
          {
            text: t("login") || "Login",
            onPress: () => router.push("/(auth)/login"),
          },
        ]
      );
      return;
    }
    router.push(`/booking/${travel.id}`);
  };

  const handleSendComment = async () => {
    if (newComment.trim() === "") return;
    try {
      const res = await createComment(id as string, { content: newComment });
      const c = res.data;
      const mapped = mapComment(c);
      // Insert at start since API returns newest first (desc order)
      setComments((prev) => [mapped, ...prev]);
      setNewComment("");
      Keyboard.dismiss();
    } catch (e: any) {
      setCommentError(e.message || "Failed to post comment");
    }
  };

  const formatDate = (dateString: any) => {
    const date = new Date(dateString);
    return format(date, "MMM dd, yyyy HH:mm", {
      // locale: i18n.language === "am" ? am : enUS,
    });
  };

  const handleToggleLike = async (comment: any) => {
    try {
      if (comment.isLiked) {
        const res = await unlikeComment(comment.id);
        setComments((prev) =>
          prev.map((c) =>
            c.id === comment.id
              ? { ...c, isLiked: false, likes: res.data.likesCount }
              : c
          )
        );
      } else {
        const res = await likeComment(comment.id);
        setComments((prev) =>
          prev.map((c) =>
            c.id === comment.id
              ? { ...c, isLiked: true, likes: res.data.likesCount }
              : c
          )
        );
      }
    } catch (e: any) {
      setCommentError(e.message || "Failed to toggle like");
    }
  };

  const actuallyDeleteComment = async (comment: any) => {
    try {
      await deleteComment(comment.id);
      setComments((prev) => prev.filter((c) => c.id !== comment.id));
    } catch (e: any) {
      setCommentError(e.message || "Failed to delete comment");
    }
  };

  const handleDeleteComment = (comment: any) => {
    Alert.alert(
      t("confirm_delete_title") || "Delete Comment",
      t("confirm_delete_message") ||
        "Are you sure you want to delete this comment?",
      [
        { text: t("cancel") || "Cancel", style: "cancel" },
        {
          text: t("delete") || "Delete",
          style: "destructive",
          onPress: () => actuallyDeleteComment(comment),
        },
      ]
    );
  };

  const renderComment = ({ item }: any) => (
    <View
      style={[
        styles.commentContainer,
        item.userId === String(user?.id)
          ? styles.myComment
          : styles.otherComment,
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

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity
            style={styles.likeButton}
            onPress={() => handleToggleLike(item)}
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
          {item.userId === String(user?.id) && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteComment(item)}
            >
              <Ionicons name="trash-outline" size={16} color="#718096" />
            </TouchableOpacity>
          )}
        </View>
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

  // Legacy placeholder removed; real like/unlike implemented.

  console.log("travel", resolveImageUrl(travel.imageUrl));

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
      <View style={styles.container}>
        {!showComments && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.imageContainer}>
              <Image
                source={{
                  uri: resolveImageUrl(travel.imageUrl) || PLACEHOLDER,
                }}
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
              <TouchableOpacity
                style={styles.shareButton}
                onPress={handleShare}
              >
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
                  {travel.startDate && travel.endDate ? (
                    <Text style={styles.duration}>
                      {new Date(travel.startDate).toLocaleDateString()} -{" "}
                      {new Date(travel.endDate).toLocaleDateString()}
                    </Text>
                  ) : null}
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

              {/* Itinerary */}
              {!showComments && travel.itinerary && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>{t("itinerary")}</Text>
                  <Text style={styles.includedText}>{travel.itinerary}</Text>
                </View>
              )}

              {!showComments && travel.requirements && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>{t("requirements")}</Text>
                  <Text style={styles.includedText}>{travel.requirements}</Text>
                </View>
              )}

              {!showComments && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>
                    {t("important_notes")}
                  </Text>
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
            </View>
          </ScrollView>
        )}
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
            {commentError && (
              <Text style={styles.errorTextSmall}>{commentError}</Text>
            )}
            <FlatList
              data={comments}
              keyExtractor={(item) => item.id}
              renderItem={renderComment}
              contentContainerStyle={styles.commentsList}
              onEndReachedThreshold={0.2}
              onEndReached={handleLoadMore}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>{t("no_comments")}</Text>
                  <Text style={styles.emptySubtext}>
                    {t("be_first_comment")}
                  </Text>
                </View>
              }
              ListFooterComponent={
                commentsLoading ? (
                  <Text style={styles.loadingText}>{t("loading")}...</Text>
                ) : commentHasMore ? (
                  <View style={styles.loadMoreContainer}>
                    {loadingMore ? (
                      <Text style={styles.loadingText}>{t("loading")}...</Text>
                    ) : (
                      <TouchableOpacity
                        style={styles.loadMoreButton}
                        onPress={handleLoadMore}
                      >
                        <Text style={styles.loadMoreText}>
                          {t("load_more") || "Load More"}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ) : comments.length > 0 ? (
                  <View style={styles.endOfListContainer}>
                    <Text style={styles.endOfListText}>
                      {t("no_more_comments") || "No more comments"}
                    </Text>
                  </View>
                ) : null
              }
            />
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
    </KeyboardAvoidingView>
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
  errorTextSmall: {
    fontSize: 14,
    color: "#e53e3e",
    marginBottom: 8,
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
  loadingText: {
    fontSize: 14,
    color: "#718096",
    marginBottom: 8,
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
  deleteButton: {
    marginLeft: 8,
    padding: 6,
    borderRadius: 6,
    backgroundColor: "#f7fafc",
  },
  loadMoreContainer: {
    paddingVertical: 12,
    alignItems: "center",
  },
  loadMoreButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#667eea",
    borderRadius: 24,
  },
  loadMoreText: {
    color: "#ffffff",
    fontWeight: "600",
  },
  endOfListContainer: {
    paddingVertical: 16,
    alignItems: "center",
  },
  endOfListText: {
    fontSize: 12,
    color: "#a0aec0",
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
