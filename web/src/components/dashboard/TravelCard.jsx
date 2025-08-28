import React from "react";
import { Link } from "react-router-dom";

const TravelCard = ({ travel }) => {
  const statusColors = {
    PLANNED: "bg-blue-100 text-blue-800",
    ONGOING: "bg-green-100 text-green-800",
    COMPLETED: "bg-gray-100 text-gray-800",
    CANCELLED: "bg-red-100 text-red-800",
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="relative">
        <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-48" />
        <span
          className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-medium ${
            statusColors[travel.status]
          }`}
        >
          {travel.status}
        </span>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-1">
          {travel.title}
        </h3>
        <p className="text-gray-500 text-sm mb-2">
          {travel.startDate} - {travel.endDate}
        </p>
        <p className="text-gray-600 mb-4 line-clamp-2">{travel.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-blue-600">
            ${travel.price}
          </span>
          <Link
            to={`/travels/${travel.id}`}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TravelCard;
