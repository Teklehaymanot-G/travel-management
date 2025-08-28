// src/components/GrayShadeTest.jsx
import React from "react";

const GrayShadeTest = () => {
  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Gray Shade Test</h2>
      <div className="grid grid-cols-5 gap-4">
        {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
          <div key={shade} className={`bg-gray-${shade} p-4 rounded shadow`}>
            <div
              className={`text-center ${
                shade > 400 ? "text-gray-100" : "text-gray-800"
              }`}
            >
              bg-gray-{shade}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GrayShadeTest;
