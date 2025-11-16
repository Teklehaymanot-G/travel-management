import apiClient from "./config";

const API_URL = "/comments";

// Fetch comments for a travel (supports optional filters/pagination)
export const getTravelComments = async (travelId, params) => {
  const res = await apiClient.get(`${API_URL}/travel/${travelId}`, { params });
  return res.data; // { success, data, pagination }
};

// Create a comment for a travel
export const createComment = async (
  travelId,
  { content, type = "PRE_TRAVEL" }
) => {
  const res = await apiClient.post(`${API_URL}/travel/${travelId}`, {
    content,
    type,
  });
  return res.data; // { success, data, message }
};

// Like a comment
export const likeComment = async (id) => {
  const res = await apiClient.post(`${API_URL}/${id}/like`);
  return res.data; // { success, data }
};

// Unlike a comment
export const unlikeComment = async (id) => {
  const res = await apiClient.delete(`${API_URL}/${id}/like`);
  return res.data; // { success, data }
};

// Delete a comment
export const deleteComment = async (id) => {
  const res = await apiClient.delete(`${API_URL}/${id}`);
  return res.data; // { success, message }
};
