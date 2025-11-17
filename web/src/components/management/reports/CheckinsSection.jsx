import React from "react";
import DataTable from "../../ui/DataTable";

const CheckinsSection = ({ checkins }) => {
  const columns = [
    {
      key: "checkedAt",
      header: "Checked At",
      render: (r) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-900">
            {r.checkedInAt ? new Date(r.checkedInAt).toLocaleDateString() : "—"}
          </span>
          <span className="text-xs text-gray-500">
            {r.checkedInAt
              ? new Date(r.checkedInAt).toLocaleTimeString()
              : "Not checked in"}
          </span>
        </div>
      ),
    },
    {
      key: "traveler",
      header: "Traveler",
      render: (r) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-8 w-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
            <span className="text-xs font-medium text-white">
              {r.booking?.traveler?.name?.charAt(0) || "T"}
            </span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">
              {r.booking?.traveler?.name || "Unknown Traveler"}
            </p>
            <p className="text-xs text-gray-500">
              {r.booking?.traveler?.phone || "No phone"}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "ticket",
      header: "Ticket",
      render: (r) => (
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-6 w-6 bg-green-100 rounded-full flex items-center justify-center">
              <svg
                className="h-3 w-3 text-green-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
          <span className="ml-2 text-sm font-medium text-gray-900">
            {r.name}
          </span>
        </div>
      ),
    },
    {
      key: "travel",
      header: "Travel",
      render: (r) => (
        <div className="max-w-xs">
          <p className="text-sm font-medium text-gray-900 truncate">
            {r.booking?.travel?.title || "Unknown Travel"}
          </p>
          <p className="text-xs text-gray-500 truncate">
            ID: {r.booking?.travelId || "—"}
          </p>
        </div>
      ),
    },
    {
      key: "checkedBy",
      header: "Checked By",
      render: (r) => (
        <div className="flex items-center">
          <div
            className={`flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center ${
              r.checkedInBy?.name ? "bg-purple-100" : "bg-gray-100"
            }`}
          >
            <span
              className={`text-xs font-medium ${
                r.checkedInBy?.name ? "text-purple-600" : "text-gray-500"
              }`}
            >
              {r.checkedInBy?.name?.charAt(0) || "S"}
            </span>
          </div>
          <span className="ml-2 text-sm text-gray-700">
            {r.checkedInBy?.name || "System"}
          </span>
        </div>
      ),
    },
  ];

  const checkinRate = checkins.totalTickets
    ? Math.round((checkins.totalChecked / checkins.totalTickets) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Check-in Analytics
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Monitor ticket check-ins and attendance rates
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
            Live Data
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Tickets Card */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700 mb-1">
                Total Tickets
              </p>
              <p className="text-3xl font-bold text-blue-900">
                {checkins.totalTickets}
              </p>
              <p className="text-xs text-blue-600 mt-1">All issued tickets</p>
            </div>
            <div className="p-3 bg-white rounded-lg shadow-sm">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Checked-in Card */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700 mb-1">
                Checked-in
              </p>
              <p className="text-3xl font-bold text-green-900">
                {checkins.totalChecked}
              </p>
              <p className="text-xs text-green-600 mt-1">
                Successful check-ins
              </p>
            </div>
            <div className="p-3 bg-white rounded-lg shadow-sm">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Check-in Rate Card */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-700 mb-1">
                Check-in Rate
              </p>
              <p className="text-3xl font-bold text-purple-900">
                {checkinRate}%
              </p>
              <div className="w-full bg-purple-200 rounded-full h-2 mt-2">
                <div
                  className="bg-purple-600 h-2 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${checkinRate}%` }}
                ></div>
              </div>
            </div>
            <div className="p-3 bg-white rounded-lg shadow-sm">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Check-ins Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Recent Check-ins
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Latest check-in activities across all travels
              </p>
            </div>
            <div className="mt-3 sm:mt-0">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-800">
                {checkins.recent?.length || 0} records
              </span>
            </div>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={checkins.recent}
          clientPaginate
          pageSize={10}
          emptyMessage={
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-10 h-10 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                No Check-in Records
              </h4>
              <p className="text-gray-500 max-w-sm mx-auto">
                Check-in records will appear here once travelers start checking
                in for their travels.
              </p>
            </div>
          }
          rowKey={(r) => r.id}
          textClass="text-gray-700"
          compact={false}
          hover={true}
          striped={true}
        />
      </div>

      {/* Quick Stats Footer */}
      {checkins.recent?.length > 0 && (
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <div className="flex flex-wrap items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span>{checkins.totalChecked} Checked-in</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
                <span>
                  {checkins.totalTickets - checkins.totalChecked} Pending
                </span>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckinsSection;
