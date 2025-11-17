import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../utils/constants";

async function getAuthHeader() {
  const token = await AsyncStorage.getItem("userToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchWitnesses({ page = 1, limit = 10, q = "" } = {}) {
  const params = new URLSearchParams();
  params.append("page", String(page));
  params.append("limit", String(limit));
  if (q) params.append("q", q);
  const url = `${API_URL}/witnesses/public?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to load witness posts");
  }
  return res.json();
}

export async function fetchWitness(id) {
  const res = await fetch(`${API_URL}/witnesses/${id}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to load witness post");
  }
  return res.json();
}

export async function fetchWitnessComments(id, { page = 1, limit = 50 } = {}) {
  const params = new URLSearchParams();
  params.append("page", String(page));
  params.append("limit", String(limit));
  const res = await fetch(
    `${API_URL}/witnesses/${id}/comments?${params.toString()}`
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to load comments");
  }
  return res.json();
}

export async function addWitnessComment(id, { content }) {
  const headers = {
    "Content-Type": "application/json",
    ...(await getAuthHeader()),
  };
  const res = await fetch(`${API_URL}/witnesses/${id}/comments`, {
    method: "POST",
    headers,
    body: JSON.stringify({ content }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to post comment");
  }
  return res.json();
}

export async function deleteWitnessComment(commentId) {
  const headers = {
    ...(await getAuthHeader()),
  };
  const res = await fetch(`${API_URL}/witnesses/comments/${commentId}`, {
    method: "DELETE",
    headers,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to delete comment");
  }
  return res.json();
}
