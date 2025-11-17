import React from "react";

const TabsNav = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { key: "summary", label: "Overview", icon: "📊" },
    { key: "payments", label: "Payments", icon: "💰" },
    { key: "checkins", label: "Check-ins", icon: "🎫" },
    { key: "compare", label: "Comparison", icon: "📈" },
    { key: "coupons", label: "Coupons", icon: "🎁" },
  ];

  return (
    <div className="border-b">
      <nav className="flex space-x-8 px-6" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === tab.key
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default TabsNav;
