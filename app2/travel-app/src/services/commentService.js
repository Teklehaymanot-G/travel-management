import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../utils/constants";

async function getAuthHeader() {
  const token = await AsyncStorage.getItem("userToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchComments(
  travelId,
  { page = 1, limit = 50, type = "all" } = {}
) {
  const params = new URLSearchParams();
  params.append("page", String(page));
  params.append("limit", String(limit));
  if (type && type !== "all") params.append("type", type);
  const headers = await getAuthHeader();
  const res = await fetch(
    `${API_URL}/comments/travel/${travelId}?${params.toString()}`,
    Object.keys(headers).length ? { headers } : undefined
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to load comments");
  }
  return res.json();
}

export async function createComment(
  travelId,
  { content, type = "PRE_TRAVEL" }
) {
  const headers = {
    "Content-Type": "application/json",
    ...(await getAuthHeader()),
  };
  const res = await fetch(`${API_URL}/comments/travel/${travelId}`, {
    method: "POST",
    headers,
    body: JSON.stringify({ content, type }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to post comment");
  }
  return res.json();
}

export async function deleteComment(commentId) {
  const headers = {
    ...(await getAuthHeader()),
  };
  const res = await fetch(`${API_URL}/comments/${commentId}`, {
    method: "DELETE",
    headers,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to delete comment");
  }
  return res.json();
}

export async function likeComment(commentId) {
  const headers = {
    ...(await getAuthHeader()),
  };
  const res = await fetch(`${API_URL}/comments/${commentId}/like`, {
    method: "POST",
    headers,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to like comment");
  }
  return res.json();
}

export async function unlikeComment(commentId) {
  const headers = {
    ...(await getAuthHeader()),
  };
  const res = await fetch(`${API_URL}/comments/${commentId}/like`, {
    method: "DELETE",
    headers,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to unlike comment");
  }
  return res.json();
}
