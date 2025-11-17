// Centralized image host configuration
// Priority of environment variables (first non-empty wins):
// 1) IMAGE_BASE_URL (e.g., http://192.168.100.54:5000)
// 2) API_BASE_URL   (e.g., http://192.168.100.54:5000)
// 3) IMAGE_PROTOCOL + IMAGE_HOST [+ IMAGE_PORT]
// 4) Fallback to request-derived protocol/host

function envBaseUrl() {
  const base =
    process.env.IMAGE_BASE_URL ||
    process.env.API_BASE_URL ||
    (process.env.IMAGE_HOST && /^https?:\/\//i.test(process.env.IMAGE_HOST)
      ? process.env.IMAGE_HOST
      : "");

  if (base) return base.replace(/\/$/, "");

  // If not a full URL, try composing from parts
  const proto = process.env.IMAGE_PROTOCOL || process.env.PROTOCOL || "http";
  const host = process.env.IMAGE_HOST || process.env.HOST || "";
  const port = process.env.IMAGE_PORT || process.env.PORT || "";
  if (!host) return "";
  const hasPort = /:\\d+$/.test(host);
  const portPart = !hasPort && port ? `:${port}` : "";
  return `${proto}://${host}${portPart}`.replace(/\/$/, "");
}

function getImageHost(req) {
  const fromEnv = envBaseUrl();
  if (fromEnv) return fromEnv;
  // Fallback to request protocol/host
  const proto = req?.protocol || "http";
  const host = req?.get ? req.get("host") : undefined;
  if (host) return `${proto}://${host}`;
  return ""; // as last resort
}

function buildImageUrl(req, relativePath) {
  if (!relativePath) return null;
  const str = String(relativePath).trim();
  // If already absolute, return as-is to avoid double host like http://ip/http://localhost/...
  if (/^https?:\/\//i.test(str)) return str;
  const cleaned = str.replace(/^\/+/, "");
  const base = getImageHost(req);
  return base ? `${base}/${cleaned}` : `/${cleaned}`;
}

module.exports = { getImageHost, buildImageUrl };
