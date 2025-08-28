import apiClient from "./config";

const API_URL = "/home";

// Get all travels with filters
export const getPublicTravels = async (params) => {
  const res = await apiClient.get(API_URL, { params });
  return res.data;
};
