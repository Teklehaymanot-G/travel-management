import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../utils/constants";

async function getAuthHeader() {
  const token = await AsyncStorage.getItem("userToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Fetch active banks (optionally include inactive if needed later)
export async function getBanks({ status = "ACTIVE" } = {}) {
  const headers = {
    ...(await getAuthHeader()),
  };
  const params = new URLSearchParams();
  if (status && status !== "all") params.append("status", status);
  const res = await fetch(`${API_URL}/banks?${params.toString()}`, {
    method: "GET",
    headers,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to load banks");
  }
  return res.json();
}
