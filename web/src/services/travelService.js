import apiClient from "./config";

const API_URL = "/travels";

// Get all travels with filters
export const getTravels = async (params) => {
  const res = await apiClient.get(API_URL, { params });
  return res.data;
};

// Get single travel by id
export const getTravel = async (id) => {
  const res = await apiClient.get(`${API_URL}/${id}`);
  return res.data;
};

// Create travel
export const createTravel = async (data) => {
  const res = await apiClient.post(API_URL, data);
  return res.data;
};

// Update travel
export const updateTravel = async (id, data) => {
  const res = await apiClient.put(`${API_URL}/${id}`, data);
  return res.data;
};

// Delete travel
export const deleteTravel = async (id) => {
  const res = await apiClient.delete(`${API_URL}/${id}`);
  return res.data;
};
