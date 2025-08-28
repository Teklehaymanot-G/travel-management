import React, { useState } from "react";
import { Tab } from "@headlessui/react";
import SupervisorDashboard from "../../components/dashboard/SupervisorDashboard";
import BookingManagement from "../../components/management/BookingManagement";
import PaymentManagement from "../../components/management/PaymentManagement";
import ActivityLog from "../../components/management/ActivityLog";
import TravelManagement from "../../components/management/TravelManagement";
import { classNames } from "../../utils/helpers";

const SupervisorPage = () => {
  const [selectedTab, setSelectedTab] = useState(0);

  const tabs = [
    { id: "dashboard", name: "Dashboard", component: <SupervisorDashboard /> },
    { id: "bookings", name: "Bookings", component: <BookingManagement /> },
    { id: "payments", name: "Payments", component: <PaymentManagement /> },
    { id: "travels", name: "Travels", component: <TravelManagement /> },
    { id: "activity", name: "Activity Log", component: <ActivityLog /> },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-0">
      <div className="mb-6">
        {/* <h1 className="text-2xl font-bold text-gray-800">
          Supervisor Dashboard
        </h1> */}
        <p className="text-gray-600 mt-1">
          Manage bookings, payments, and monitor traveler activity
        </p>
      </div>

      <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
        <Tab.List className="flex space-x-1 rounded-xl bg-gray-100 p-1 mb-6">
          {tabs.map((tab) => (
            <Tab
              key={tab.id}
              className={({ selected }) =>
                classNames(
                  "w-full py-2.5 text-sm font-medium leading-5 rounded-lg",
                  "focus:outline-none focus:ring-2 ring-offset-2 ring-offset-blue-400 ring-white ring-opacity-60",
                  selected
                    ? "bg-white shadow text-blue-700"
                    : "text-gray-700 hover:bg-white/[0.12] hover:text-blue-600"
                )
              }
            >
              {tab.name}
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels className="mt-2">
          {tabs.map((tab, idx) => (
            <Tab.Panel
              key={idx}
              className={classNames(
                "rounded-xl bg-white p-3",
                "focus:outline-none focus:ring-2 ring-offset-2 ring-offset-blue-400 ring-white ring-opacity-60"
              )}
            >
              {tab.component}
            </Tab.Panel>
          ))}
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
};

// Add default export
export default SupervisorPage;
