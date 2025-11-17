import api from "./config";

// Public
export async function getPublicWitnesses(params = {}) {
  const res = await api.get("/witnesses/public", { params });
  return res.data;
}

export async function getWitnessById(id) {
  const res = await api.get(`/witnesses/${id}`);
  return res.data;
}

export async function getWitnessComments(id, params = {}) {
  const res = await api.get(`/witnesses/${id}/comments`, { params });
  return res.data;
}

export async function addWitnessComment(id, payload) {
  const res = await api.post(`/witnesses/${id}/comments`, payload);
  return res.data;
}

export async function deleteWitnessComment(commentId) {
  const res = await api.delete(`/witnesses/comments/${commentId}`);
  return res.data;
}

// Admin
export async function adminListWitnesses(params = {}) {
  const res = await api.get("/witnesses/admin/list", { params });
  return res.data;
}

export async function createWitness(payload) {
  const res = await api.post("/witnesses", payload);
  return res.data;
}

export async function updateWitness(id, payload) {
  const res = await api.put(`/witnesses/${id}`, payload);
  return res.data;
}

export async function setWitnessStatus(id, status) {
  const res = await api.patch(`/witnesses/${id}/status`, { status });
  return res.data;
}

export async function deleteWitness(id) {
  const res = await api.delete(`/witnesses/${id}`);
  return res.data;
}
