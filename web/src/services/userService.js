import apiClient from "./config";

const USERS = "/users";
const ROLES = "/roles";

export const listUsers = async (params) => {
  const res = await apiClient.get(USERS, { params });
  return res.data;
};

export const getUser = async (id) => {
  const res = await apiClient.get(`${USERS}/${id}`);
  return res.data;
};

export const createUser = async (payload) => {
  const res = await apiClient.post(USERS, payload);
  return res.data;
};

export const updateUser = async (id, payload) => {
  const res = await apiClient.put(`${USERS}/${id}`, payload);
  return res.data;
};

export const deleteUser = async (id) => {
  const res = await apiClient.delete(`${USERS}/${id}`);
  return res.data;
};

export const listRoles = async () => {
  const res = await apiClient.get(ROLES);
  return res.data;
};

export const updateUserRole = async (userId, role) => {
  const res = await apiClient.patch(`${ROLES}/user/${userId}`, { role });
  return res.data;
};
