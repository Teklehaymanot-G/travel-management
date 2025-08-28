import React from "react";
import { Link } from "react-router-dom";

const DocumentCard = ({ document }) => {
  const getIcon = () => {
    const fileType = document.title.split(".").pop().toLowerCase();

    switch (fileType) {
      case "pdf":
        return (
          <div className="bg-red-100 p-3 rounded-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
        );
      case "doc":
      case "docx":
        return (
          <div className="bg-blue-100 p-3 rounded-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
        );
      case "xls":
      case "xlsx":
        return (
          <div className="bg-green-100 p-3 rounded-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
        );
      default:
        return (
          <div className="bg-gray-100 p-3 rounded-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
      {getIcon()}
      <div className="ml-4 flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {document.title}
        </p>
        <p className="text-sm text-gray-500 truncate">
          {document.type} • {document.createdAt}
        </p>
      </div>
      <div className="ml-4">
        <Link
          to={document.fileUrl}
          target="_blank"
          className="text-blue-600 hover:text-blue-800 font-medium text-sm"
        >
          View
        </Link>
      </div>
    </div>
  );
};

export default DocumentCard;
