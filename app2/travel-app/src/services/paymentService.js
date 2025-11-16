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
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to submit payment");
  }
  return res.json();
}
