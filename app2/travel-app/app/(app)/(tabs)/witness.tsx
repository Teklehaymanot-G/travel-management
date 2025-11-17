import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { fetchWitnesses } from "@/src/services/witnessService";

export default function WitnessTabScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [posts, setPosts] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);

  const load = async (reset = false) => {
    try {
      setError(null);
      if (reset) {
        setPage(1);
        setLoading(true);
      }
      const currentPage = reset ? 1 : page;
      const res = await fetchWitnesses({ page: currentPage, limit: 10 });
      const items = res?.data || [];
      const pages = res?.pagination?.pages || 1;
      setHasMore(currentPage < pages);
      setPosts((prev) => (reset ? items : [...prev, ...items]));
    } catch (e: any) {
      setError(e.message || "Failed to load witness posts");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (page > 1) load(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const onRefresh = () => {
    setRefreshing(true);
    load(true);
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/(app)/witness/${item.id}`)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Ionicons name="megaphone" size={20} color="#6366f1" />
      </View>
      <Text style={styles.metaText}>
        {new Date(item.createdAt).toLocaleDateString()} • {item.commentsCount}{" "}
        {t("comments", { defaultValue: "comments" })}
      </Text>
      <Text style={styles.excerpt} numberOfLines={3}>
        {item.content}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={(it) => String(it.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          <View style={styles.headerWrap}>
            <Text style={styles.headerTitle}>
              {t("witness", { defaultValue: "Witness" })}
            </Text>
            <Text style={styles.headerSubtitle}>
              {t("witness_intro", {
                defaultValue: "Read shared experiences and reflections.",
              })}
            </Text>
          </View>
        }
        ListEmptyComponent={
          !loading && !error ? (
            <View style={styles.emptyWrap}>
              <Ionicons name="megaphone-outline" size={42} color="#6366f1" />
              <Text style={styles.emptyText}>
                {t("no_witness_posts", {
                  defaultValue: "No witness posts yet",
                })}
              </Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          <View style={{ paddingVertical: 16 }}>
            {loading && posts.length === 0 ? (
              <ActivityIndicator size="large" color="#6366f1" />
            ) : null}
            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity
                  style={styles.retryBtn}
                  onPress={() => load(true)}
                >
                  <Text style={styles.retryText}>
                    {t("retry", { defaultValue: "Retry" })}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : null}
            {!loading && hasMore && !error ? (
              <TouchableOpacity
                style={styles.loadMoreBtn}
                onPress={() => setPage((p) => p + 1)}
              >
                <Text style={styles.loadMoreText}>{t("load_more")}</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  listContent: { padding: 16, paddingBottom: 48 },
  headerWrap: { marginBottom: 12 },
  headerTitle: { fontSize: 24, fontWeight: "700", color: "#1e293b" },
  headerSubtitle: { fontSize: 14, color: "#64748b", marginTop: 4 },
  card: {
    backgroundColor: "#ffffff",
    padding: 14,
    borderRadius: 14,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    flex: 1,
    paddingRight: 8,
  },
  metaText: { fontSize: 11, color: "#64748b", marginBottom: 8 },
  excerpt: { fontSize: 13, color: "#334155", lineHeight: 18 },
  emptyWrap: { alignItems: "center", paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 14, color: "#64748b" },
  errorBox: {
    backgroundColor: "#fff5f5",
    borderColor: "#fecaca",
    borderWidth: 1,
    padding: 12,
    borderRadius: 10,
  },
  errorText: { color: "#dc2626", fontSize: 14 },
  retryBtn: { marginTop: 8 },
  retryText: { color: "#6366f1", fontWeight: "600" },
  loadMoreBtn: { paddingVertical: 10, alignItems: "center" },
  loadMoreText: { color: "#6366f1", fontWeight: "600" },
});
