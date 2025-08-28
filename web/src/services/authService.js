import apiClient from "./config";

const API_URL = "/auth";

// Get Me
export const getMe = async (params) => {
  const res = await apiClient.get(`${API_URL}/me`, { params });
  return res.data;
};

// Login
export const loginAuth = async (phone, password) => {
  const res = await apiClient.post(`${API_URL}/login`, { phone, password });
  return res;
};

// Register
export const registerAuth = async (data) => {
  const res = await apiClient.post(`${API_URL}/register`, data);
  return res.data;
};
