import apiClient from "./config";

const API_URL = "/payments";

export const getPayments = async (params) => {
  const res = await apiClient.get(API_URL, { params });
  return res.data;
};

export const updatePaymentStatus = async (id, { status, message }) => {
  if (id === undefined || id === null) {
    throw new Error("Payment ID is required for status update");
  }
  const body = { status };
  if (message) body.message = message;
  const res = await apiClient.patch(`${API_URL}/${id}/status`, body);
  return res.data;
};

export const createPayment = async ({ bookingId, receiptUrl }) => {
  const res = await apiClient.post(API_URL, { bookingId, receiptUrl });
  return res.data;
};
