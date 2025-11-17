import React, { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import {
  fetchWitness,
  fetchWitnessComments,
  addWitnessComment,
  deleteWitnessComment,
} from "@/src/services/witnessService";
import { useAuth } from "@/src/context/AuthContext";

export default function WitnessDetailScreen() {
  const { id } = useLocalSearchParams();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [post, setPost] = useState<any | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState("");
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);

  const load = async () => {
    if (!id) return;
    try {
      setError(null);
      setLoading(true);
      const res = await fetchWitness(id as string);
      setPost(res?.data || null);
    } catch (e: any) {
      setError(e.message || "Failed to load post");
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    if (!id) return;
    try {
      setCommentError(null);
      setCommentsLoading(true);
      const res = await fetchWitnessComments(id as string, {
        page: 1,
        limit: 50,
      });
      setComments(res?.data || []);
    } catch (e: any) {
      setCommentError(e.message || "Failed to load comments");
    } finally {
      setCommentsLoading(false);
    }
  };

  useEffect(() => {
    load();
    loadComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const onAddComment = async () => {
    if (!user) return;
    if (!commentText.trim()) return;
    try {
      await addWitnessComment(id as string, { content: commentText.trim() });
      setCommentText("");
      loadComments();
    } catch (e: any) {
      alert(e.message || "Failed to add comment");
    }
  };

  const canDelete = (c: any) => {
    if (!user) return false;
    const role = (user.role || "").toUpperCase();
    if (role === "MANAGER" || role === "SUPERVISOR") return true;
    return c.user?.id === user.id;
  };

  const onDeleteComment = async (commentId: number) => {
    try {
      await deleteWitnessComment(commentId);
      loadComments();
    } catch (e: any) {
      alert(e.message || "Failed to delete comment");
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  if (error || !post) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>
          {error || t("not_found", { defaultValue: "Not found" })}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{post.title}</Text>
      <Text style={styles.meta}>
        {new Date(post.createdAt).toLocaleString()} •{" "}
        {post.author?.name || t("unknown", { defaultValue: "Unknown" })}
      </Text>
      <Text style={styles.body} selectable>
        {post.content}
      </Text>

      <View style={styles.commentsHeader}>
        <Text style={styles.commentsTitle}>
          {t("comments", { defaultValue: "Comments" })}
        </Text>
        <Ionicons
          name="chatbubble-ellipses-outline"
          size={20}
          color="#6366f1"
        />
      </View>

      {commentsLoading ? (
        <ActivityIndicator
          size="small"
          color="#6366f1"
          style={{ marginVertical: 12 }}
        />
      ) : null}
      {commentError ? (
        <Text style={styles.commentError}>{commentError}</Text>
      ) : null}
      {comments.length === 0 && !commentsLoading && !commentError ? (
        <Text style={styles.emptyComments}>
          {t("no_comments", { defaultValue: "No comments yet" })}
        </Text>
      ) : null}
      {comments.map((c) => (
        <View key={c.id} style={styles.commentBox}>
          <View style={styles.commentRow}>
            <Text style={styles.commentAuthor}>
              {c.user?.name || t("user", { defaultValue: "User" })}
            </Text>
            <Text style={styles.commentDate}>
              {new Date(c.createdAt).toLocaleDateString()}
            </Text>
            {canDelete(c) && (
              <TouchableOpacity onPress={() => onDeleteComment(c.id)}>
                <Ionicons name="trash" size={18} color="#dc2626" />
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.commentContent}>{c.content}</Text>
        </View>
      ))}

      <View style={styles.addCommentWrap}>
        <TextInput
          style={styles.commentInput}
          placeholder={
            user
              ? t("add_comment", { defaultValue: "Write a comment..." })
              : t("login_to_comment", { defaultValue: "Login to comment" })
          }
          value={commentText}
          onChangeText={setCommentText}
          editable={!!user}
          multiline
        />
        <TouchableOpacity
          style={[
            styles.submitBtn,
            !user || !commentText.trim() ? styles.submitBtnDisabled : null,
          ]}
          disabled={!user || !commentText.trim()}
          onPress={onAddComment}
        >
          <Text style={styles.submitBtnText}>
            {t("post", { defaultValue: "Post" })}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  content: { padding: 16, paddingBottom: 40 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 24, fontWeight: "700", color: "#1e293b", marginBottom: 6 },
  meta: { fontSize: 12, color: "#64748b", marginBottom: 14 },
  body: { fontSize: 15, lineHeight: 22, color: "#334155", marginBottom: 20 },
  commentsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  commentsTitle: { fontSize: 18, fontWeight: "600", color: "#1e293b" },
  commentBox: {
    backgroundColor: "#ffffff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  commentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  commentAuthor: { fontSize: 13, fontWeight: "600", color: "#1e293b" },
  commentDate: { fontSize: 11, color: "#64748b", flex: 1 },
  commentContent: { fontSize: 13, color: "#334155" },
  commentError: { fontSize: 12, color: "#dc2626", marginBottom: 8 },
  emptyComments: { fontSize: 13, color: "#64748b", marginBottom: 12 },
  addCommentWrap: { marginTop: 8 },
  commentInput: {
    backgroundColor: "#ffffff",
    padding: 12,
    borderRadius: 12,
    minHeight: 80,
    textAlignVertical: "top",
    fontSize: 14,
    color: "#1e293b",
    marginBottom: 12,
  },
  submitBtn: {
    backgroundColor: "#6366f1",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  submitBtnDisabled: { opacity: 0.5 },
  submitBtnText: { color: "#ffffff", fontWeight: "600", fontSize: 14 },
  errorText: { color: "#dc2626", fontSize: 14 },
});
