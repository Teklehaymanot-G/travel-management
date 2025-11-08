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
  // If FormData is provided, ensure correct headers override JSON default
  const isForm = typeof FormData !== "undefined" && data instanceof FormData;
  const config = isForm
    ? { headers: { "Content-Type": "multipart/form-data" } }
    : undefined;
  const res = await apiClient.post(API_URL, data, config);
  return res.data;
};

// Update travel
export const updateTravel = async (id, data) => {
  const isForm = typeof FormData !== "undefined" && data instanceof FormData;
  const config = isForm
    ? { headers: { "Content-Type": "multipart/form-data" } }
    : undefined;
  const res = await apiClient.put(`${API_URL}/${id}`, data, config);
  return res.data;
};

// Upload or replace only the image for a travel
export const uploadTravelImage = async (id, file) => {
  const form = new FormData();
  form.append("image", file);
  const res = await apiClient.put(`${API_URL}/${id}/image`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// Delete travel
export const deleteTravel = async (id) => {
  const res = await apiClient.delete(`${API_URL}/${id}`);
  return res.data;
};
