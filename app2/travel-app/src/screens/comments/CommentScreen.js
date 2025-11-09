import { format } from "date-fns";
import { am, enUS } from "date-fns/locale";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Keyboard,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import theme from "../../config/theme";
import { useAuth } from "../../context/AuthContext";
import {
  createComment,
  deleteComment,
  fetchComments,
  likeComment,
  unlikeComment,
} from "../../services/commentService";
import { resolveImageUrl } from "../../utils/image";
import { isRTL } from "../../utils/rtl";

const AVATAR_PLACEHOLDER =
  "https://static.vecteezy.com/system/resources/previews/047/733/682/non_2x/grey-avatar-icon-user-avatar-photo-icon-social-media-user-icon-vector.jpg";

const CommentScreen = ({ route }) => {
  const { t, i18n } = useTranslation();
  const { travel } = route.params;
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loadingInitial, setLoadingInitial] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const limit = 20;
  const [sending, setSending] = useState(false);
  const [filterType, setFilterType] = useState("all"); // all | PRE_TRAVEL | POST_TRAVEL

  const mapComment = useCallback(
    (c) => ({
      id: String(c.id),
      userId: String(c.traveler?.id || c.travelerId || ""),
      userName: c.traveler?.name || c.traveler?.phone || t("traveler"),
      content: c.content,
      type: c.type,
      createdAt: c.createdAt,
      likes: c.likesCount || 0,
      isLiked: !!c.likedByMe,
      avatar: c.traveler?.avatarUrl
        ? resolveImageUrl(c.traveler.avatarUrl)
        : AVATAR_PLACEHOLDER,
      canDelete: String(c.traveler?.id) === String(user?.id),
    }),
    [user, t]
  );

  const loadComments = useCallback(
    async (targetPage = 1, append = false) => {
      if (!travel?.id) return;
      try {
        if (!append) setError(null);
        if (append) {
          setLoadingMore(true);
        } else {
          setLoadingInitial(true);
        }
        const res = await fetchComments(travel.id, {
          page: targetPage,
          limit,
          type: filterType,
        });
        const mapped = (res.data || []).map(mapComment);
        setComments((prev) => (append ? [...prev, ...mapped] : mapped));
        const pages = res.pagination?.pages || 1;
        setHasMore(targetPage < pages);
        setPage(targetPage);
      } catch (e) {
        setError(e.message || "Failed to load comments");
      } finally {
        if (append) {
          setLoadingMore(false);
        } else {
          setLoadingInitial(false);
        }
        setRefreshing(false);
      }
    },
    [travel?.id, mapComment, filterType]
  );

  useEffect(() => {
    loadComments(1, false);
  }, [loadComments]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadComments(1, false);
  };

  const handleLoadMore = () => {
    if (loadingMore || !hasMore) return;
    loadComments(page + 1, true);
  };

  const handleSend = async () => {
    if (newComment.trim() === "" || sending) return;
    try {
      setSending(true);
      const optimistic = {
        id: `temp-${Date.now()}`,
        userId: String(user?.id || "me"),
        userName: user?.name || user?.phone || t("you"),
        content: newComment,
        type: "PRE_TRAVEL",
        createdAt: new Date().toISOString(),
        likes: 0,
        isLiked: false,
        avatar: AVATAR_PLACEHOLDER,
        canDelete: true,
        optimistic: true,
      };
      setComments((prev) => [optimistic, ...prev]);
      const creationType =
        filterType === "POST_TRAVEL" ? "POST_TRAVEL" : "PRE_TRAVEL";
      const res = await createComment(travel.id, {
        content: newComment,
        type: creationType,
      });
      const real = mapComment(res.data);
      setComments((prev) =>
        prev.map((c) => (c.id === optimistic.id ? real : c))
      );
      setNewComment("");
      Keyboard.dismiss();
    } catch (e) {
      setError(e.message || "Failed to post comment");
      // rollback optimistic
      setComments((prev) => prev.filter((c) => !c.optimistic));
    } finally {
      setSending(false);
    }
  };

  const handleToggleLike = async (comment) => {
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
    } catch (e) {
      setError(e.message || "Failed to toggle like");
    }
  };

  const confirmDelete = (comment) => {
    Alert.alert(
      t("confirm_delete_title") || "Delete Comment",
      t("confirm_delete_message") ||
        "Are you sure you want to delete this comment?",
      [
        { text: t("cancel") || "Cancel", style: "cancel" },
        {
          text: t("delete") || "Delete",
          style: "destructive",
          onPress: () => handleDelete(comment),
        },
      ]
    );
  };

  const handleDelete = async (comment) => {
    try {
      await deleteComment(comment.id);
      setComments((prev) => prev.filter((c) => c.id !== comment.id));
    } catch (e) {
      setError(e.message || "Failed to delete comment");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, "MMM dd, yyyy HH:mm", {
      locale: i18n.language === "am" ? am : enUS,
    });
  };

  const renderComment = ({ item }) => {
    return (
      <View
        style={[
          styles.commentContainer,
          item.userId === String(user?.id)
            ? styles.myComment
            : styles.otherComment,
          isRTL && styles.rtlComment,
        ]}
      >
        <View style={styles.commentHeader}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
          </View>
          <View style={styles.commentMeta}>
            <Text style={styles.userName}>{item.userName}</Text>
            <Text style={styles.commentDate}>{formatDate(item.createdAt)}</Text>
          </View>
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.likeButton}
              onPress={() => handleToggleLike(item)}
              disabled={item.optimistic}
            >
              <Text style={[styles.likeText, item.isLiked && styles.liked]}>
                {item.isLiked ? "♥" : "♡"} {item.likes}
              </Text>
            </TouchableOpacity>
            {item.canDelete && !item.optimistic && (
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => confirmDelete(item)}
              >
                <Text style={styles.deleteText}>×</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        <Text style={styles.commentText}>{item.content}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {error && <Text style={styles.errorText}>{error}</Text>}
      <FlatList
        data={comments}
        keyExtractor={(item) => item.id}
        renderItem={renderComment}
        contentContainerStyle={styles.commentsList}
        ListHeaderComponent={
          <View style={styles.headerWrapper}>
            <View style={styles.travelHeader}>
              {travel?.imageUrl ? (
                <Image
                  source={{ uri: resolveImageUrl(travel.imageUrl) }}
                  style={styles.travelImage}
                />
              ) : null}
              <View style={styles.travelMeta}>
                <Text style={styles.travelTitle}>{travel?.title}</Text>
                {travel?.startDate && travel?.endDate ? (
                  <Text style={styles.travelDates}>
                    {new Date(travel.startDate).toLocaleDateString()} - {""}
                    {new Date(travel.endDate).toLocaleDateString()}
                  </Text>
                ) : null}
              </View>
            </View>
            <View style={styles.segmentContainer}>
              {[
                { key: "all", label: t("all") || "All" },
                { key: "PRE_TRAVEL", label: t("pre_travel") || "Pre" },
                { key: "POST_TRAVEL", label: t("post_travel") || "Post" },
              ].map((seg) => (
                <TouchableOpacity
                  key={seg.key}
                  style={[
                    styles.segmentButton,
                    filterType === seg.key && styles.segmentButtonActive,
                  ]}
                  onPress={() => {
                    if (filterType !== seg.key) {
                      setFilterType(seg.key);
                      setPage(1);
                      loadComments(1, false);
                    }
                  }}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      filterType === seg.key && styles.segmentTextActive,
                    ]}
                  >
                    {seg.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
          />
        }
        onEndReachedThreshold={0.2}
        onEndReached={handleLoadMore}
        ListEmptyComponent={
          loadingInitial ? (
            <View style={styles.emptyContainer}>
              <ActivityIndicator color={theme.colors.primary} />
              <Text style={styles.emptySubtext}>{t("loading")}</Text>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>{t("no_comments")}</Text>
              <Text style={styles.emptySubtext}>{t("be_first_comment")}</Text>
            </View>
          )
        }
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator color={theme.colors.primary} />
            </View>
          ) : hasMore ? (
            <TouchableOpacity
              style={styles.loadMoreButton}
              onPress={handleLoadMore}
            >
              <Text style={styles.loadMoreText}>{t("load_more")}</Text>
            </TouchableOpacity>
          ) : comments.length > 0 ? (
            <View style={styles.endTextWrapper}>
              <Text style={styles.endText}>{t("no_more_comments")}</Text>
            </View>
          ) : null
        }
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, isRTL && styles.rtlInput]}
          placeholder={t("write_comment")}
          value={newComment}
          onChangeText={setNewComment}
          multiline
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            (newComment.trim() === "" || sending) && styles.sendDisabled,
          ]}
          onPress={handleSend}
          disabled={newComment.trim() === "" || sending}
        >
          <Text style={styles.sendButtonText}>
            {sending ? t("sending") : t("send")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  commentsList: {
    padding: theme.spacing.m,
    paddingBottom: 70,
  },
  headerWrapper: {
    marginBottom: theme.spacing.m,
  },
  travelHeader: {
    flexDirection: "row",
    marginBottom: theme.spacing.s,
    alignItems: "center",
  },
  travelImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: theme.spacing.m,
    backgroundColor: theme.colors.light,
  },
  travelMeta: {
    flex: 1,
  },
  travelTitle: {
    fontSize: theme.fontSize.large,
    fontWeight: "600",
    color: theme.colors.dark,
    ...(isRTL && { textAlign: "right" }),
  },
  travelDates: {
    fontSize: theme.fontSize.small,
    color: theme.colors.gray,
    marginTop: 2,
    ...(isRTL && { textAlign: "right" }),
  },
  segmentContainer: {
    flexDirection: "row",
    backgroundColor: theme.colors.light,
    borderRadius: 24,
    padding: 4,
    alignSelf: "flex-start",
  },
  segmentButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  segmentButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  segmentText: {
    fontSize: theme.fontSize.small,
    color: theme.colors.gray,
    fontWeight: "500",
  },
  segmentTextActive: {
    color: theme.colors.white,
  },
  commentContainer: {
    maxWidth: "80%",
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.medium,
    marginBottom: theme.spacing.m,
    backgroundColor: theme.colors.white,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  myComment: {
    backgroundColor: theme.colors.primaryLight,
    alignSelf: "flex-end",
    borderTopRightRadius: isRTL ? theme.borderRadius.medium : 0,
    borderTopLeftRadius: isRTL ? 0 : theme.borderRadius.medium,
  },
  otherComment: {
    backgroundColor: theme.colors.light,
    alignSelf: "flex-start",
    borderTopRightRadius: isRTL ? 0 : theme.borderRadius.medium,
    borderTopLeftRadius: isRTL ? theme.borderRadius.medium : 0,
  },
  rtlComment: {
    alignSelf: isRTL ? "flex-start" : "flex-end",
  },
  userName: {
    fontWeight: "bold",
    color: theme.colors.dark,
    marginBottom: theme.spacing.xs,
    ...(isRTL && { textAlign: "right" }),
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.xs,
  },
  avatarContainer: {
    marginRight: theme.spacing.s,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.light,
  },
  commentMeta: {
    flex: 1,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: theme.spacing.s,
  },
  likeButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 16,
    backgroundColor: theme.colors.light,
    marginRight: theme.spacing.xs,
  },
  likeText: {
    fontSize: theme.fontSize.small,
    color: theme.colors.gray,
  },
  liked: {
    color: theme.colors.danger,
    fontWeight: "600",
  },
  deleteButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    backgroundColor: theme.colors.light,
  },
  deleteText: {
    color: theme.colors.gray,
    fontSize: theme.fontSize.medium,
    fontWeight: "600",
  },
  commentText: {
    color: theme.colors.dark,
    marginBottom: theme.spacing.xs,
    ...(isRTL && { textAlign: "right" }),
  },
  commentDate: {
    fontSize: theme.fontSize.small,
    color: theme.colors.gray,
    ...(isRTL && { textAlign: "right" }),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.xl,
  },
  emptyText: {
    fontSize: theme.fontSize.large,
    color: theme.colors.gray,
    marginBottom: theme.spacing.s,
    ...(isRTL && { textAlign: "right" }),
  },
  emptySubtext: {
    fontSize: theme.fontSize.medium,
    color: theme.colors.gray,
    ...(isRTL && { textAlign: "right" }),
  },
  inputContainer: {
    flexDirection: isRTL ? "row-reverse" : "row",
    alignItems: "center",
    padding: theme.spacing.s,
    borderTopWidth: 1,
    borderColor: theme.colors.light,
    backgroundColor: theme.colors.white,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    padding: theme.spacing.s,
    backgroundColor: theme.colors.light,
    borderRadius: theme.borderRadius.medium,
    paddingHorizontal: theme.spacing.m,
  },
  rtlInput: {
    textAlign: "right",
  },
  sendButton: {
    marginLeft: isRTL ? 0 : theme.spacing.s,
    marginRight: isRTL ? theme.spacing.s : 0,
    padding: theme.spacing.s,
    minWidth: 80,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.borderRadius.medium,
    backgroundColor: theme.colors.primaryLight,
  },
  sendDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: theme.colors.primary,
    fontWeight: "bold",
    fontSize: theme.fontSize.medium,
  },
  errorText: {
    color: theme.colors.danger,
    textAlign: "center",
    marginTop: theme.spacing.s,
  },
  footerLoader: {
    paddingVertical: theme.spacing.m,
  },
  loadMoreButton: {
    alignSelf: "center",
    paddingHorizontal: theme.spacing.l,
    paddingVertical: theme.spacing.s,
    backgroundColor: theme.colors.primary,
    borderRadius: 24,
    marginVertical: theme.spacing.s,
  },
  loadMoreText: {
    color: theme.colors.white,
    fontWeight: "600",
  },
  endTextWrapper: {
    alignItems: "center",
    paddingVertical: theme.spacing.s,
  },
  endText: {
    fontSize: theme.fontSize.small,
    color: theme.colors.gray,
  },
});

export default CommentScreen;
