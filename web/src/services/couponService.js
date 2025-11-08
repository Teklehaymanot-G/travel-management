import apiClient from "./config";

const API_URL = "/coupons"; // Expected backend base path (not yet implemented)

// Graceful wrapper: if backend not ready, these will throw; caller can fallback to dummy data.

export const listCoupons = async (params = {}) => {
  try {
    const res = await apiClient.get(API_URL, { params });
    return res.data; // Expect shape: { data: [], total, page, limit }
  } catch (err) {
    console.warn(
      "Coupon API listCoupons failed, falling back",
      err?.response?.data || err.message
    );
    throw err;
  }
};

export const createCoupon = async (payload) => {
  const res = await apiClient.post(API_URL, payload);
  return res.data;
};

export const updateCoupon = async (id, payload) => {
  const res = await apiClient.put(`${API_URL}/${id}`, payload);
  return res.data;
};

export const deleteCoupon = async (id) => {
  const res = await apiClient.delete(`${API_URL}/${id}`);
  return res.data;
};

export const toggleCouponActive = async (id) => {
  const res = await apiClient.patch(`${API_URL}/${id}/toggle-active`);
  return res.data; // Expect updated coupon
};

export default {
  listCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  toggleCouponActive,
};
