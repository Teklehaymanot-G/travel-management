import { getAuthToken } from "./authToken"; // helper to fetch stored token
import { API_URL } from "@/src/utils/constants"; // unify base URL with rest of app

const baseUrl = API_URL; // Ensures device uses LAN IP / configured env var

export async function scanTicket(code: string) {
  const token = await getAuthToken?.();
  let res: Response;
  try {
    res = await fetch(`${baseUrl}/tickets/scan`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ code }),
    });
  } catch (e: any) {
    // Network / DNS / CORS / device connectivity errors
    const msg =
      e.name === "AbortError"
        ? "Request timed out. Check Wi-Fi / API server."
        : /Network request failed/i.test(e.message || "")
        ? "Network request failed. Ensure device can reach API (use LAN IP in EXPO_PUBLIC_API_URL)."
        : e.message || "Network error during scan.";
    throw new Error(msg);
  }
  let data: any = {};
  try {
    data = await res.json();
  } catch {
    // Non-JSON response
    if (!res.ok) throw new Error("Scan failed (invalid server response)");
    return {};
  }
  if (!res.ok) throw new Error(data.message || "Scan failed");
  return data;
}
