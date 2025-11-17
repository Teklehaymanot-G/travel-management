import React, { useMemo } from "react";
import { formatCurrency } from "../../../utils/helpers";
import DataTable from "../../ui/DataTable";

const CouponsSection = ({ couponUsage }) => {
  // Calculate statistics
  const stats = useMemo(() => {
    const items = couponUsage.items || [];
    const totalCoupons = items.length;
    const totalUsage = items.reduce((sum, c) => sum + (c._count?._all || 0), 0);
    const totalDiscounts = items.reduce(
      (sum, c) => sum + (c._sum?.discountAmount || 0),
      0
    );
    const totalRevenue = items.reduce(
      (sum, c) => sum + (c._sum?.finalAmount || 0),
      0
    );
    const avgDiscount = totalUsage > 0 ? totalDiscounts / totalUsage : 0;

    // Find most popular coupon
    const mostPopular = items.reduce(
      (max, c) => ((c._count?._all || 0) > (max._count?._all || 0) ? c : max),
      { _count: { _all: 0 } }
    );

    return {
      totalCoupons,
      totalUsage,
      totalDiscounts,
      totalRevenue,
      avgDiscount,
      mostPopular: mostPopular.couponCode || "None",
      mostPopularUsage: mostPopular._count?._all || 0,
    };
  }, [couponUsage]);

  const columns = [
    {
      key: "code",
      header: "Coupon Code",
      render: (c) =>
        c.couponCode ? (
          <div className="flex items-center">
            <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
              <span className="text-xs font-bold text-white">#</span>
            </div>
            <div>
              <span className="font-semibold text-gray-900 block">
                {c.couponCode}
              </span>
              <span className="text-xs text-gray-500">
                {c._count?._all || 0} uses
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center">
            <div className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center mr-3">
              <span className="text-xs font-bold text-gray-500">—</span>
            </div>
            <span className="text-gray-400 italic">(No coupon)</span>
          </div>
        ),
    },
    {
      key: "count",
      header: "Usage",
      render: (c) => (
        <div className="flex flex-col items-center">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
            {c._count?._all || 0}
          </span>
          <span className="text-xs text-gray-500 mt-1">times used</span>
        </div>
      ),
    },
    {
      key: "discounts",
      header: "Discounts",
      align: "right",
      render: (c) => (
        <div className="text-right">
          <span className="text-red-600 font-bold text-lg block">
            {formatCurrency(c._sum?.discountAmount || 0)}
          </span>
          <span className="text-xs text-gray-500">total savings</span>
        </div>
      ),
    },
    {
      key: "revenue",
      header: "Revenue",
      align: "right",
      render: (c) => (
        <div className="text-right">
          <span className="text-green-600 font-bold text-lg block">
            {formatCurrency(c._sum?.finalAmount || 0)}
          </span>
          <span className="text-xs text-gray-500">linked revenue</span>
        </div>
      ),
    },
    {
      key: "avgDiscount",
      header: "Avg. Discount",
      align: "right",
      render: (c) => {
        const usage = c._count?._all || 0;
        const totalDiscount = c._sum?.discountAmount || 0;
        const avg = usage > 0 ? totalDiscount / usage : 0;

        return (
          <div className="text-right">
            <span className="text-purple-600 font-semibold block">
              {formatCurrency(avg)}
            </span>
            <span className="text-xs text-gray-500">per use</span>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Coupon Analytics</h2>
          <p className="text-sm text-gray-600 mt-1">
            Track coupon performance and discount impact
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
            <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
            {stats.totalCoupons} Active Coupons
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Usage */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700 mb-1">
                Total Usage
              </p>
              <p className="text-3xl font-bold text-blue-900">
                {stats.totalUsage}
              </p>
              <p className="text-xs text-blue-600 mt-1">Times used</p>
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
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Total Discounts */}
        <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl border border-red-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-700 mb-1">
                Total Discounts
              </p>
              <p className="text-3xl font-bold text-red-900">
                {formatCurrency(stats.totalDiscounts)}
              </p>
              <p className="text-xs text-red-600 mt-1">Given to customers</p>
            </div>
            <div className="p-3 bg-white rounded-lg shadow-sm">
              <svg
                className="w-6 h-6 text-red-600"
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

        {/* Linked Revenue */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700 mb-1">
                Linked Revenue
              </p>
              <p className="text-3xl font-bold text-green-900">
                {formatCurrency(stats.totalRevenue)}
              </p>
              <p className="text-xs text-green-600 mt-1">From coupon users</p>
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

        {/* Most Popular */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-700 mb-1">
                Most Popular
              </p>
              <p className="text-lg font-bold text-purple-900 truncate">
                {stats.mostPopular}
              </p>
              <p className="text-xs text-purple-600 mt-1">
                {stats.mostPopularUsage} uses
              </p>
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
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Average Discount */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">
                Average Discount
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats.avgDiscount)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Per coupon use</p>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-orange-600">
                {stats.totalUsage > 0
                  ? Math.round(
                      (stats.avgDiscount /
                        (stats.totalRevenue / stats.totalUsage)) *
                        100
                    )
                  : 0}
                %
              </div>
              <p className="text-xs text-gray-500">of avg. order</p>
            </div>
          </div>
        </div>

        {/* Efficiency Metric */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">
                Coupon Efficiency
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalDiscounts > 0
                  ? Math.round(
                      (stats.totalRevenue / stats.totalDiscounts) * 100
                    )
                  : 0}
                %
              </p>
              <p className="text-xs text-gray-500 mt-1">Revenue per discount</p>
            </div>
            <div className="text-right">
              <div
                className={`text-lg font-semibold ${
                  stats.totalRevenue / stats.totalDiscounts > 3
                    ? "text-green-600"
                    : stats.totalRevenue / stats.totalDiscounts > 1.5
                    ? "text-yellow-600"
                    : "text-red-600"
                }`}
              >
                {stats.totalDiscounts > 0
                  ? (stats.totalRevenue / stats.totalDiscounts).toFixed(1)
                  : 0}
                x
              </div>
              <p className="text-xs text-gray-500">ROI multiplier</p>
            </div>
          </div>
        </div>
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Coupon Performance
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Detailed breakdown of coupon usage and impact
              </p>
            </div>
            <div className="mt-3 sm:mt-0">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-800">
                {couponUsage.items?.length || 0} coupons
              </span>
            </div>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={couponUsage.items || []}
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
                    d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                  />
                </svg>
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                No Coupon Data
              </h4>
              <p className="text-gray-500 max-w-sm mx-auto">
                Coupon usage analytics will appear here once customers start
                using coupons for their bookings.
              </p>
            </div>
          }
          rowKey={(c) => c.couponCode || "none"}
          textClass="text-gray-700"
          compact={false}
          hover={true}
          striped={true}
        />
      </div>

      {/* Summary Footer */}
      {couponUsage.items?.length > 0 && (
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <div className="flex flex-wrap items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span>{stats.totalUsage} Total Uses</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                <span>
                  {formatCurrency(stats.totalDiscounts)} Total Discounts
                </span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <span>{stats.totalCoupons} Active Coupons</span>
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

export default CouponsSection;
