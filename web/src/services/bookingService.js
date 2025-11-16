import apiClient from "./config";

const API_URL = "/bookings";

export const createBooking = async (data) => {
  const res = await apiClient.post(API_URL, data);
  return res.data;
};

export const getBookings = async (params) => {
  const res = await apiClient.get(API_URL, { params });
  return res.data;
};

export const getBooking = async (id) => {
  const res = await apiClient.get(`${API_URL}/${id}`);
  return res.data;
};

export const cancelBooking = async (id) => {
  const res = await apiClient.patch(`${API_URL}/${id}/cancel`);
  return res.data;
};

export const getMyBookings = async (params) => {
  const res = await apiClient.get(`${API_URL}/my-bookings`, { params });
  return res.data;
};
