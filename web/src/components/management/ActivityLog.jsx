import React from "react";
import { activityLog } from "../../utils/dummyData";
import DataGrid from "../../ui/DataGrid";

const ActivityLog = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Activity Log</h2>
      </div>

      <div className="bg-white rounded-lg shadow">
        <DataGrid
          headers={["User", "Action", "Timestamp"]}
          rows={activityLog.map((activity) => [
            <div className="flex items-center">
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-8 h-8" />
              <span className="ml-2">{activity.user}</span>
            </div>,
            activity.action,
            activity.timestamp,
          ])}
          onRowClick={(activity) => console.log("View activity:", activity)}
        />
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium mb-4">Activity Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: "Total Activities",
              value: activityLog.length,
              change: "+12%",
              color: "bg-blue-100 text-blue-800",
            },
            {
              title: "Manager Activities",
              value: activityLog.filter((a) => a.user.includes("Manager"))
                .length,
              change: "+8%",
              color: "bg-purple-100 text-purple-800",
            },
            {
              title: "Supervisor Activities",
              value: activityLog.filter((a) => a.user.includes("Supervisor"))
                .length,
              change: "+15%",
              color: "bg-green-100 text-green-800",
            },
          ].map((stat, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="text-gray-500 text-sm">{stat.title}</div>
              <div className="text-2xl font-bold mt-1">{stat.value}</div>
              <div
                className={`text-xs mt-1 ${stat.color} px-2 py-1 rounded-full inline-block`}
              >
                {stat.change}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActivityLog;
