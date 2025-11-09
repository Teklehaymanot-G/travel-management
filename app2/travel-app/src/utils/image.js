// Shared image URL resolver for React Native app
// Handles relative paths stored in DB (e.g. uploads/travels/file.jpg) and absolute URLs
// Ensures we swap localhost for the LAN IP if provided via EXPO_PUBLIC_API_URL
import { API_URL } from "./constants";

export function resolveImageUrl(raw) {
  if (!raw || !String(raw).trim()) return null;
  const val = String(raw).trim();
  // Absolute already
  if (/^https?:\/\//i.test(val)) return val;
  // Remove leading slashes
  const cleaned = val.replace(/^\/+/, "");
  // Build base root (strip trailing /api if present)
  const base = API_URL.replace(/\/$/, "");
  const root = base.endsWith("/api") ? base.slice(0, -4) : base;
  return `${root}/${cleaned}`;
}
