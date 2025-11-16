import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../utils/constants";

async function getAuthHeader() {
  const token = await AsyncStorage.getItem("userToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Create a payment submission with receiptUrl and optional metadata
export async function createPayment({
  bookingId,
  receiptUrl,
  transactionNumber,
  bank,
  paymentDate,
  couponCode,
}) {
  const headers = {
    "Content-Type": "application/json",
    ...(await getAuthHeader()),
  };
  const res = await fetch(`${API_URL}/payments`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      bookingId,
      receiptUrl,
      transactionNumber,
      bank,
      paymentDate,
      couponCode,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to submit payment");
  }
  return res.json();
}

// Validate a coupon with optional base amount and participant count
export async function validateCoupon({ code, amount, participants = 1 }) {
  const headers = {
    ...(await getAuthHeader()),
  };
  const params = new URLSearchParams();
  if (code) params.append("code", code);
  if (amount != null) params.append("amount", String(amount));
  if (participants != null) params.append("participants", String(participants));
  const res = await fetch(`${API_URL}/coupons/validate?${params.toString()}`, {
    method: "GET",
    headers,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to validate coupon");
  }
  return res.json();
}
