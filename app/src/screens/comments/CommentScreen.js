import { format } from "date-fns";
import { am, enUS } from "date-fns/locale";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import theme from "../../config/theme";
import { isRTL } from "../../utils/rtl";

const CommentScreen = ({ route }) => {
  const { t, i18n } = useTranslation();
  const { travel } = route.params;
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Simulate loading comments
    setIsLoading(true);
    setTimeout(() => {
      setComments([
        {
          id: "1",
          userId: "user1",
          userName: "John Traveler",
          content: t("comment_question"),
          type: "PRE_TRAVEL",
          createdAt: "2023-10-15T14:30:00Z",
        },
        {
          id: "2",
          userId: "admin",
          userName: "Travel Support",
          content: t("comment_answer"),
          type: "PRE_TRAVEL",
          createdAt: "2023-10-15T16:45:00Z",
        },
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleSend = () => {
    if (newComment.trim() === "") return;

    const newCommentObj = {
      id: Date.now().toString(),
      userId: "currentUser",
      userName: "You",
      content: newComment,
      type: "PRE_TRAVEL",
      createdAt: new Date().toISOString(),
    };

    setComments([...comments, newCommentObj]);
    setNewComment("");
    Keyboard.dismiss();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, "MMM dd, yyyy HH:mm", {
      locale: i18n.language === "am" ? am : enUS,
    });
  };

  const renderComment = ({ item }) => (
    <View
      style={[
        styles.commentContainer,
        item.userId === "currentUser" ? styles.myComment : styles.otherComment,
        isRTL && styles.rtlComment,
      ]}
    >
      <Text style={styles.userName}>{item.userName}</Text>
      <Text style={styles.commentText}>{item.content}</Text>
      <Text style={styles.commentDate}>{formatDate(item.createdAt)}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={comments}
        keyExtractor={(item) => item.id}
        renderItem={renderComment}
        contentContainerStyle={styles.commentsList}
        inverted={comments.length > 0}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{t("no_comments")}</Text>
            <Text style={styles.emptySubtext}>{t("be_first_comment")}</Text>
          </View>
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
          style={styles.sendButton}
          onPress={handleSend}
          disabled={newComment.trim() === ""}
        >
          <Text style={styles.sendButtonText}>{t("send")}</Text>
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
  commentContainer: {
    maxWidth: "80%",
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.medium,
    marginBottom: theme.spacing.m,
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
  },
  sendButtonText: {
    color: theme.colors.primary,
    fontWeight: "bold",
    fontSize: theme.fontSize.medium,
  },
});

export default CommentScreen;
