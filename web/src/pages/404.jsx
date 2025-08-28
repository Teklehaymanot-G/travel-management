import React from "react";
import { Link } from "react-router-dom";
import ErrorDisplay from "../components/common/ErrorDisplay";

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <ErrorDisplay
        statusCode="404"
        title="Page Not Found"
        message="Oops! The page you're looking for doesn't exist or has been moved."
      />

      <div className="mt-10 flex justify-center space-x-4">
        <Link
          to="/"
          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Go to Home
        </Link>

        <Link
          to="/login"
          className="px-6 py-3 bg-white text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors"
        >
          Login Page
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
