// src/components/common/ErrorDisplay.jsx
import React from "react";

const ErrorDisplay = ({ statusCode, title, message }) => {
  return (
    <div className="text-center py-12">
      <h1 className="text-9xl font-bold text-blue-600">{statusCode}</h1>
      <h2 className="mt-4 text-3xl font-bold text-gray-900">{title}</h2>
      <p className="mt-4 text-lg text-gray-600">{message}</p>
    </div>
  );
};

export default ErrorDisplay;
