import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../utils/constants";

async function getAuthHeader() {
  const token = await AsyncStorage.getItem("userToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function createBooking({ travelId, travelers }) {
  const headers = {
    "Content-Type": "application/json",
    ...(await getAuthHeader()),
  };
  const res = await fetch(`${API_URL}/bookings`, {
    method: "POST",
    headers,
    body: JSON.stringify({ travelId, travelers }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to create booking");
  }
  return res.json();
}

export async function getMyBookings({
  page = 1,
  limit = 10,
  status = "all",
} = {}) {
  const headers = {
    ...(await getAuthHeader()),
  };
  const params = new URLSearchParams();
  params.append("page", String(page));
  params.append("limit", String(limit));
  if (status && status !== "all") params.append("status", status);
  const res = await fetch(
    `${API_URL}/bookings/my-bookings?${params.toString()}`,
    {
      method: "GET",
      headers,
    }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to load bookings");
  }
  return res.json();
}

export async function cancelBooking(id) {
  const headers = {
    ...(await getAuthHeader()),
  };
  const res = await fetch(`${API_URL}/bookings/${id}/cancel`, {
    method: "PATCH",
    headers,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to cancel booking");
  }
  return res.json();
}
