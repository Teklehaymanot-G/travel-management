import { API_URL } from "@/src/utils/constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

export async function updateMe(payload) {
  // Retrieve token from storage
  const token = await AsyncStorage.getItem("userToken");
  if (!token) {
    throw new Error("Not authenticated: missing token");
  }
  const res = await fetch(`${API_URL}/auth/me`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || "Failed to update profile");
  }
  return data.user || data;
}
