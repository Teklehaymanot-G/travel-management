import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../utils/constants";

async function getAuthHeader() {
  const token = await AsyncStorage.getItem("userToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchTravels({
  page = 1,
  limit = 10,
  status = "all",
  search = "",
} = {}) {
  const params = new URLSearchParams();
  params.append("page", String(page));
  params.append("limit", String(limit));
  if (status && status !== "all") params.append("status", status);
  if (search) params.append("search", search);

  const headers = {
    "Content-Type": "application/json",
    ...(await getAuthHeader()),
  };
  const res = await fetch(`${API_URL}/travels?${params.toString()}`, {
    method: "GET",
    headers,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to load travels");
  }
  return res.json();
}

export async function fetchTravel(id) {
  const headers = {
    "Content-Type": "application/json",
    ...(await getAuthHeader()),
  };
  const res = await fetch(`${API_URL}/travels/${id}`, {
    method: "GET",
    headers,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to load travel");
  }
  return res.json();
}
