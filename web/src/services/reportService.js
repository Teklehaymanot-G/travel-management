import api from "./config";

export async function getSummary(params = {}) {
  const res = await api.get("/reports/summary", { params });
  return res.data;
}

export async function getPayments(params = {}) {
  const res = await api.get("/reports/payments", { params });
  return res.data;
}

export async function getCheckins(params = {}) {
  const res = await api.get("/reports/checkins", { params });
  return res.data;
}

export async function getCouponUsage(params = {}) {
  const res = await api.get("/reports/coupons", { params });
  return res.data;
}

export async function getTravelComparison(params = {}) {
  const res = await api.get("/reports/travels/compare", { params });
  return res.data;
}
