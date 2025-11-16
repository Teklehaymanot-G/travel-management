import client from "./config";

export async function getBanks({ status = "all" } = {}) {
  const params = new URLSearchParams();
  if (status && status !== "all") params.append("status", status);
  const res = await client.get(`/banks?${params.toString()}`);
  return res.data;
}

export async function createBank(data) {
  const form = new FormData();
  Object.entries(data).forEach(([k, v]) => {
    if (v !== undefined && v !== null) form.append(k, v);
  });
  const res = await client.post(`/banks`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function updateBank(id, data) {
  const form = new FormData();
  Object.entries(data).forEach(([k, v]) => {
    if (v !== undefined && v !== null) form.append(k, v);
  });
  const res = await client.patch(`/banks/${id}`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function toggleBank(id) {
  const res = await client.patch(`/banks/${id}/toggle`);
  return res.data;
}

export async function deleteBank(id) {
  const res = await client.delete(`/banks/${id}`);
  return res.data;
}
