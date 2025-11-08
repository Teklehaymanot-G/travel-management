import axios from "axios";

const baseURL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  "http://localhost:5000/api";

const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  // withCredentials: true, // optional: if using cookies for auth
});

apiClient.interceptors.request.use((config) => {
  const user = localStorage.getItem("travel-user")
    ? JSON.parse(localStorage.getItem("travel-user"))
    : null;
  if (user) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${user?.token}`;
  }
  return config;
});

export default apiClient;
