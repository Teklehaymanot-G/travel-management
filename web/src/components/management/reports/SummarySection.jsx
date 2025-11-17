import React from "react";
import { Line } from "react-chartjs-2";
import { formatCurrency } from "../../../utils/helpers";

const SummarySection = ({ summary, checkins, chartData, chartOptions }) => {
  if (!summary) return null;

  // Calculate additional statistics
  const totalPayments = Object.values(summary.payments.status || {}).reduce(
    (a, b) => a + b,
    0
  );
  const approvalRate =
    totalPayments > 0
      ? Math.round((summary.payments.status.APPROVED / totalPayments) * 100)
      : 0;

  const checkinRate =
    checkins.totalTickets > 0
      ? Math.round((checkins.totalChecked / checkins.totalTickets) * 100)
      : 0;

  const averageTransaction =
    totalPayments > 0 ? summary.payments.amounts.revenue / totalPayments : 0;

  const discountRate =
    summary.payments.amounts.revenue > 0
      ? Math.round(
          (summary.payments.amounts.discounts /
            summary.payments.amounts.revenue) *
            100
        )
      : 0;

  // Icons for the new stats
  const PaymentIcon = () => (
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
        d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
      />
    </svg>
  );

  const ApprovalIcon = () => (
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
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
      />
    </svg>
  );

  const AverageIcon = () => (
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
  );

  const DiscountRateIcon = () => (
    <svg
      className="w-6 h-6 text-yellow-600"
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
  );

  const MoneyIcon = () => (
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
        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
      />
    </svg>
  );

  const CheckIcon = () => (
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
  );

  const TicketIcon = () => (
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
        d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
      />
    </svg>
  );

  const DiscountIcon = () => (
    <svg
      className="w-6 h-6 text-yellow-600"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V4a2 2 0 10-4 0v2h4z"
      />
    </svg>
  );

  const StatCard = ({
    title,
    value,
    subtitle,
    icon,
    color = "blue",
    trend,
    trendValue,
  }) => {
    const colorClasses = {
      blue: "from-blue-50 to-blue-100 border-blue-200",
      green: "from-green-50 to-green-100 border-green-200",
      purple: "from-purple-50 to-purple-100 border-purple-200",
      yellow: "from-yellow-50 to-yellow-100 border-yellow-200",
      indigo: "from-indigo-50 to-indigo-100 border-indigo-200",
      pink: "from-pink-50 to-pink-100 border-pink-200",
    };

    const textColorClasses = {
      blue: "text-blue-700",
      green: "text-green-700",
      purple: "text-purple-700",
      yellow: "text-yellow-700",
      indigo: "text-indigo-700",
      pink: "text-pink-700",
    };

    return (
      <div
        className={`bg-gradient-to-br ${colorClasses[color]} p-6 rounded-xl border shadow-sm hover:shadow-md transition-all duration-200`}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p
              className={`text-sm font-medium ${textColorClasses[color]} mb-1`}
            >
              {title}
            </p>
            <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
            {subtitle && <p className="text-xs text-gray-600">{subtitle}</p>}
            {trend && (
              <div
                className={`inline-flex items-center mt-2 px-2 py-1 rounded-full text-xs font-medium ${
                  trend === "up"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {trend === "up" ? "↗" : "↘"} {trendValue}
              </div>
            )}
          </div>
          <div className="p-3 bg-white rounded-lg shadow-sm">{icon}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Business Overview
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Key performance indicators and revenue analytics
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border border-blue-200">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
            Real-time Dashboard
          </div>
        </div>
      </div>

      {/* Stats Grid - Expanded to 8 cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Revenue Metrics */}
        <StatCard
          title="Total Revenue"
          value={formatCurrency(summary.payments.amounts.revenue || 0)}
          subtitle="All-time collected revenue"
          icon={<MoneyIcon />}
          color="blue"
          trend="up"
          trendValue="+12%"
        />

        <StatCard
          title="Average Transaction"
          value={formatCurrency(averageTransaction)}
          subtitle="Per payment"
          icon={<AverageIcon />}
          color="indigo"
        />

        {/* Payment Metrics */}
        <StatCard
          title="Total Payments"
          value={totalPayments}
          subtitle={`${summary.payments.status.APPROVED} approved`}
          icon={<PaymentIcon />}
          color="green"
        />

        <StatCard
          title="Approval Rate"
          value={`${approvalRate}%`}
          subtitle="Successful payments"
          icon={<ApprovalIcon />}
          color="green"
          trend="up"
          trendValue="+5%"
        />

        {/* Check-in Metrics */}
        <StatCard
          title="Tickets Checked-in"
          value={`${checkins.totalChecked} / ${checkins.totalTickets}`}
          subtitle={`${checkinRate}% check-in rate`}
          icon={<TicketIcon />}
          color="purple"
        />

        <StatCard
          title="Check-in Rate"
          value={`${checkinRate}%`}
          subtitle="Attendance performance"
          icon={<CheckIcon />}
          color="purple"
        />

        {/* Discount Metrics */}
        <StatCard
          title="Total Discounts"
          value={formatCurrency(summary.payments.amounts.discounts || 0)}
          subtitle="Amount saved by customers"
          icon={<DiscountIcon />}
          color="yellow"
        />

        <StatCard
          title="Discount Rate"
          value={`${discountRate}%`}
          subtitle="Of total revenue"
          icon={<DiscountRateIcon />}
          color="yellow"
        />
      </div>

      {/* Payment Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Status Card */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Payment Status
            </h3>
            <span className="text-sm text-gray-500">Distribution</span>
          </div>
          <div className="space-y-4">
            {[
              {
                status: "Approved",
                count: summary.payments.status.APPROVED,
                color: "bg-green-500",
                text: "text-green-700",
              },
              {
                status: "Pending",
                count: summary.payments.status.PENDING,
                color: "bg-yellow-500",
                text: "text-yellow-700",
              },
              {
                status: "Rejected",
                count: summary.payments.status.REJECTED,
                color: "bg-red-500",
                text: "text-red-700",
              },
            ].map((item) => {
              const percentage =
                totalPayments > 0
                  ? Math.round((item.count / totalPayments) * 100)
                  : 0;
              return (
                <div key={item.status} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className={`font-medium ${item.text}`}>
                      {item.status}
                    </span>
                    <span className="text-gray-600">
                      {item.count} ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${item.color} transition-all duration-500 ease-out`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Stats Card */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Performance Summary
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-blue-600">
                {approvalRate}%
              </div>
              <div className="text-sm text-gray-600 mt-1">Success Rate</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-green-600">
                {checkinRate}%
              </div>
              <div className="text-sm text-gray-600 mt-1">Check-in Rate</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-purple-600">
                {totalPayments}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Total Transactions
              </div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-yellow-600">
                {discountRate}%
              </div>
              <div className="text-sm text-gray-600 mt-1">Discount Usage</div>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Revenue Trend
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Daily revenue performance over time
            </p>
          </div>
          <div className="mt-3 sm:mt-0 flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Revenue</span>
            </div>
            <div className="text-sm text-gray-500">
              {chartData?.labels?.length || 0} days
            </div>
          </div>
        </div>
        <div className="h-80">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* Footer Summary */}
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
        <div className="flex flex-wrap items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-6">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span>{summary.payments.status.APPROVED} Approved Payments</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
              <span>{summary.payments.status.PENDING} Pending</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
              <span>{summary.payments.status.REJECTED} Rejected</span>
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-2 sm:mt-0">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummarySection;
