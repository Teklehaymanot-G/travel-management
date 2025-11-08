import React from "react";
import { formatCurrency } from "../../utils/helpers";

const TravelCard = ({ travel }) => {
  const PLACEHOLDER = "/saint.jpeg"; // local asset from public/
  const statusColors = {
    PLANNED: "bg-blue-100 text-blue-800",
    ONGOING: "bg-green-100 text-green-800",
    COMPLETED: "bg-gray-100 text-gray-800",
    CANCELLED: "bg-red-100 text-red-800",
  };

  const statusLabels = {
    PLANNED: "Planned",
    ONGOING: "Ongoing",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
  };

  // Helper to build absolute image URL when backend returns relative path (e.g. "uploads/travels/filename.jpg")
  const resolveImageUrl = (raw) => {
    if (!raw || !raw.trim()) return null;
    const normalized = raw.replace(/\\/g, "/"); // handle Windows backslashes
    if (/^https?:\/\//i.test(normalized)) return normalized; // already absolute
    // Strip query/hash early (not expected but safe)
    const withoutQuery = normalized.split(/[?#]/)[0];
    // Normalize leading slashes and ./
    const cleaned = withoutQuery.replace(/^\.\/+/, "").replace(/^\/+/, "");
    // Remove accidental leading "uploads/" duplication (e.g., uploads/uploads/travels/...)
    const deduped = cleaned.replace(/^uploads\/uploads\//, "uploads/");
    // Ensure begins with uploads/
    const path = deduped.startsWith("uploads/")
      ? deduped
      : `uploads/${deduped}`;
    const base = (
      import.meta.env?.VITE_API_URL || "http://localhost:5000/api"
    ).replace(/\/$/, "");
    const root = base.endsWith("/api") ? base.slice(0, -4) : base;
    const resolved = `${root}/${path}`;
    if (import.meta.env?.DEV) {
      console.debug("[TravelCard] resolveImageUrl", {
        raw,
        normalized,
        cleaned,
        deduped,
        resolved,
      });
    }
    return resolved;
  };

  const imageSrc = resolveImageUrl(travel.imageUrl) || PLACEHOLDER;
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden transition-transform duration-200 hover:shadow-lg hover:-translate-y-1">
      <div className="relative">
        <div className="bg-gray-200 rounded-xl w-full h-48 overflow-hidden">
          <img
            src={imageSrc}
            alt={travel.title || "Travel image"}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = PLACEHOLDER;
            }}
          />
        </div>
        <span
          className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-medium ${
            statusColors[travel.status]
          }`}
        >
          {statusLabels[travel.status]}
        </span>
      </div>

      <div className="p-5">
        <h3 className="text-lg font-bold text-gray-800 mb-2">{travel.title}</h3>
        <p className="text-gray-600 mb-4 line-clamp-2">{travel.description}</p>

        <div className="flex justify-between items-center mb-3">
          <div>
            <p className="text-sm text-gray-500">Dates</p>
            <p className="text-gray-700">
              {new Date(travel.startDate).toLocaleDateString()} -{" "}
              {new Date(travel.endDate).toLocaleDateString()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Bookings</p>
            <p className="text-gray-700 font-medium">{travel.bookings}</p>
          </div>
        </div>

        <div className="flex justify-between items-center border-t border-gray-100 pt-3">
          <span className="text-xl font-bold text-blue-600">
            {formatCurrency(travel.price)}
          </span>
          <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default TravelCard;
