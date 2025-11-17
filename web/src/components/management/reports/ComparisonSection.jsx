import React, { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import { formatCurrency } from "../../../utils/helpers";
import DataTable from "../../ui/DataTable";

const ComparisonSection = ({
  travelCompare,
  compareChartData,
  chartOptions,
}) => {
  // Calculate statistics from travelCompare data
  const stats = useMemo(() => {
    const items = travelCompare.items || [];

    if (items.length === 0) {
      return {
        totalRevenue: 0,
        totalBookings: 0,
        totalTravelers: 0,
        avgRevenuePerTravel: 0,
        topPerformingTravel: null,
        totalDiscounts: 0,
        checkinRate: 0,
      };
    }

    const totalRevenue = items.reduce(
      (sum, item) => sum + (item.revenue || 0),
      0
    );
    const totalBookings = items.reduce(
      (sum, item) => sum + (item.bookings || 0),
      0
    );
    const totalTravelers = items.reduce(
      (sum, item) => sum + (item.travelers || 0),
      0
    );
    const totalDiscounts = items.reduce(
      (sum, item) => sum + (item.discounts || 0),
      0
    );
    const totalTickets = items.reduce(
      (sum, item) => sum + (item.tickets || 0),
      0
    );
    const totalCheckedIns = items.reduce(
      (sum, item) => sum + (item.checkedIns || 0),
      0
    );

    const avgRevenuePerTravel = totalRevenue / items.length;
    const topPerformingTravel = items.reduce(
      (top, item) => (!top || item.revenue > top.revenue ? item : top),
      null
    );

    const checkinRate =
      totalTickets > 0 ? (totalCheckedIns / totalTickets) * 100 : 0;

    return {
      totalRevenue,
      totalBookings,
      totalTravelers,
      avgRevenuePerTravel,
      topPerformingTravel,
      totalDiscounts,
      checkinRate: Math.round(checkinRate),
      totalTravels: items.length,
    };
  }, [travelCompare.items]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Travel Performance
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Compare travel performance metrics and revenue analytics
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
            <div className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></div>
            {stats.totalTravels} Travels
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700 mb-1">
                Total Revenue
              </p>
              <p className="text-2xl font-bold text-green-900">
                {formatCurrency(stats.totalRevenue)}
              </p>
              <p className="text-xs text-green-600 mt-1">Across all travels</p>
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
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Total Bookings */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700 mb-1">
                Total Bookings
              </p>
              <p className="text-2xl font-bold text-blue-900">
                {stats.totalBookings}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                {stats.totalTravelers} travelers
              </p>
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
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Average Revenue */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-700 mb-1">
                Avg. Revenue
              </p>
              <p className="text-2xl font-bold text-purple-900">
                {formatCurrency(stats.avgRevenuePerTravel)}
              </p>
              <p className="text-xs text-purple-600 mt-1">Per travel</p>
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
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Check-in Rate */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-700 mb-1">
                Check-in Rate
              </p>
              <p className="text-2xl font-bold text-orange-900">
                {stats.checkinRate}%
              </p>
              <div className="w-full bg-orange-200 rounded-full h-2 mt-2">
                <div
                  className="bg-orange-600 h-2 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${stats.checkinRate}%` }}
                ></div>
              </div>
            </div>
            <div className="p-3 bg-white rounded-lg shadow-sm">
              <svg
                className="w-6 h-6 text-orange-600"
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
      </div>

      {/* Performance Highlights */}
      {stats.topPerformingTravel && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Performing Travel */}
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-xl border border-indigo-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-indigo-900">
                Top Performing Travel
              </h3>
              <div className="px-3 py-1 bg-indigo-600 text-white rounded-full text-sm font-medium">
                #1
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xl font-bold text-indigo-900">
                  {stats.topPerformingTravel.travelTitle ||
                    `Travel ${stats.topPerformingTravel.travelId}`}
                </p>
                <p className="text-indigo-600 text-sm">
                  Highest revenue generator
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-indigo-700 font-medium">Revenue</p>
                  <p className="text-indigo-900 font-bold">
                    {formatCurrency(stats.topPerformingTravel.revenue || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-indigo-700 font-medium">Bookings</p>
                  <p className="text-indigo-900 font-bold">
                    {stats.topPerformingTravel.bookings || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Discounts Summary */}
          <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl border border-red-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-red-900">
                Discounts Overview
              </h3>
              <div className="px-3 py-1 bg-red-600 text-white rounded-full text-sm font-medium">
                Total
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xl font-bold text-red-900">
                  {formatCurrency(stats.totalDiscounts)}
                </p>
                <p className="text-red-600 text-sm">Total discounts applied</p>
              </div>
              <div className="text-sm text-red-700">
                <p>
                  Average discount:{" "}
                  {formatCurrency(stats.totalDiscounts / stats.totalTravels)}{" "}
                  per travel
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comparison Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Travel Performance Comparison
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Detailed metrics for each travel package
              </p>
            </div>
            <div className="mt-3 sm:mt-0">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-800">
                {travelCompare.items?.length || 0} travels
              </span>
            </div>
          </div>
        </div>

        <DataTable
          columns={[
            {
              key: "travel",
              header: "Travel",
              render: (i) => (
                <div className="max-w-xs">
                  <span className="font-medium text-gray-900 block truncate">
                    {i.travelTitle || `Travel ${i.travelId}`}
                  </span>
                  {i.travelId && (
                    <span className="text-xs text-gray-500">
                      ID: {i.travelId}
                    </span>
                  )}
                </div>
              ),
            },
            {
              key: "revenue",
              header: "Revenue",
              align: "right",
              render: (i) => (
                <div className="text-right">
                  <span className="font-semibold text-gray-900 block">
                    {formatCurrency(i.revenue || 0)}
                  </span>
                  {i.bookings > 0 && (
                    <span className="text-xs text-gray-500">
                      {formatCurrency((i.revenue || 0) / i.bookings)} avg
                    </span>
                  )}
                </div>
              ),
            },
            {
              key: "bookings",
              header: "Bookings",
              render: (i) => (
                <div className="flex items-center">
                  <span className="text-gray-700 font-medium">
                    {i.bookings || 0}
                  </span>
                  {i.travelers > 0 && (
                    <span className="ml-2 text-xs text-gray-500">
                      ({i.travelers} travelers)
                    </span>
                  )}
                </div>
              ),
            },
            {
              key: "travelers",
              header: "Travelers",
              render: (i) => (
                <span className="text-gray-700">{i.travelers || 0}</span>
              ),
            },
            {
              key: "couponCount",
              header: "Coupons",
              render: (i) => (
                <span className="text-gray-700">{i.couponCount || 0}</span>
              ),
            },
            {
              key: "discounts",
              header: "Discounts",
              align: "right",
              render: (i) => (
                <span className="text-red-600 font-medium">
                  {formatCurrency(i.discounts || 0)}
                </span>
              ),
            },
            {
              key: "tickets",
              header: "Tickets",
              render: (i) => (
                <span className="text-gray-700">{i.tickets || 0}</span>
              ),
            },
            {
              key: "checkedIns",
              header: "Checked-in",
              render: (i) => (
                <div className="flex items-center">
                  <span className="text-gray-700">{i.checkedIns || 0}</span>
                  {i.tickets > 0 && (
                    <span className="ml-2 text-xs text-gray-500">
                      {Math.round(((i.checkedIns || 0) / i.tickets) * 100)}%
                    </span>
                  )}
                </div>
              ),
            },
            {
              key: "topBank",
              header: "Top Bank",
              render: (i) =>
                i.topBank ? (
                  <div className="max-w-xs">
                    <span className="text-gray-700 block">
                      {i.topBank.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatCurrency(i.topBank.revenue)}
                    </span>
                  </div>
                ) : (
                  <span className="text-gray-400">-</span>
                ),
            },
          ]}
          data={travelCompare.items || []}
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
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                No Comparison Data
              </h4>
              <p className="text-gray-500 max-w-sm mx-auto">
                Travel performance data will appear here once you have multiple
                travels with booking activity.
              </p>
            </div>
          }
          rowKey={(i) => i.travelId}
          textClass="text-gray-700"
          compact={false}
          hover={true}
          striped={true}
        />
      </div>

      {/* Chart Section */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Top Travels Comparison
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Revenue vs Bookings across top performing travels
            </p>
          </div>
          <div className="mt-3 sm:mt-0">
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-teal-500 rounded mr-2"></div>
                <span className="text-gray-600">Revenue</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                <span className="text-gray-600">Bookings</span>
              </div>
            </div>
          </div>
        </div>
        <div className="h-80">
          <Bar data={compareChartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};

export default ComparisonSection;
