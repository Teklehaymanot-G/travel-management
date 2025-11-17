import React, { useMemo } from "react";
import { formatCurrency } from "../../../utils/helpers";
import DataTable from "../../ui/DataTable";

const PaymentsSection = ({ payments, onPageChange, loading = false }) => {
  // Calculate payment statistics
  const paymentStats = useMemo(() => {
    const totalRevenue = payments.items.reduce(
      (sum, payment) => sum + (payment.finalAmount || 0),
      0
    );
    const totalDiscounts = payments.items.reduce(
      (sum, payment) => sum + (payment.discountAmount || 0),
      0
    );

    const statusCounts = payments.items.reduce((acc, payment) => {
      acc[payment.status] = (acc[payment.status] || 0) + 1;
      return acc;
    }, {});

    // Calculate daily revenue for the last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split("T")[0];
    }).reverse();

    const dailyRevenue = last7Days.reduce((acc, date) => {
      const dayRevenue = payments.items.reduce((sum, payment) => {
        const paymentDate = new Date(payment.createdAt)
          .toISOString()
          .split("T")[0];
        return paymentDate === date ? sum + (payment.finalAmount || 0) : sum;
      }, 0);
      acc[date] = dayRevenue;
      return acc;
    }, {});

    // Calculate bank distribution
    const bankDistribution = payments.items.reduce((acc, payment) => {
      const bank = payment.bank || "Unknown";
      acc[bank] = (acc[bank] || 0) + 1;
      return acc;
    }, {});

    return {
      totalRevenue,
      totalDiscounts,
      statusCounts,
      dailyRevenue,
      bankDistribution,
      averageAmount:
        payments.items.length > 0 ? totalRevenue / payments.items.length : 0,
      totalPayments: payments.items.length,
    };
  }, [payments.items]);

  const getStatusIcon = (status) => {
    switch (status) {
      case "APPROVED":
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "PENDING":
        return (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case "REJECTED":
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  const getBankIcon = (bankName) => {
    const bankIcons = {
      CBE: "🏦",
      "Commercial Bank of Ethiopia": "🏦",
      "Awash Bank": "🏛️",
      "Dashen Bank": "🏢",
      "Abyssinia Bank": "🏣",
      "Bank of Abyssinia": "🏣",
      NIB: "🏤",
    };
    return bankIcons[bankName] || "💳";
  };

  // Simple Analytics Components
  const RevenueTrend = () => {
    const days = Object.keys(paymentStats.dailyRevenue);
    const values = Object.values(paymentStats.dailyRevenue);
    const maxValue = Math.max(...values, 1); // Avoid division by zero

    return (
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">
          Revenue Trend (7 Days)
        </h4>
        <div className="flex items-end justify-between h-20 space-x-1">
          {days.map((day, index) => {
            const revenue = paymentStats.dailyRevenue[day];
            const height = (revenue / maxValue) * 50;
            return (
              <div key={day} className="flex flex-col items-center flex-1">
                <div
                  className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t transition-all duration-500"
                  style={{ height: `${height}px` }}
                ></div>
                <span className="text-xs text-gray-500 mt-1 truncate">
                  {new Date(day).toLocaleDateString("en-US", {
                    weekday: "short",
                  })}
                </span>
                <span className="text-xs text-gray-400">
                  {formatCurrency(revenue)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const StatusDistribution = () => {
    const total = paymentStats.totalPayments;
    if (total === 0) return null;

    return (
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">
          Payment Status
        </h4>
        <div className="space-y-2">
          {Object.entries(paymentStats.statusCounts).map(([status, count]) => {
            const percentage = (count / total) * 100;
            const colorClass =
              {
                APPROVED: "bg-green-500",
                PENDING: "bg-yellow-500",
                REJECTED: "bg-red-500",
              }[status] || "bg-gray-500";

            return (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${colorClass}`}></div>
                  <span className="text-sm text-gray-700 capitalize">
                    {status.toLowerCase()}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${colorClass} transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-8 text-right">
                    {count}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const BankDistribution = () => {
    const total = paymentStats.totalPayments;
    if (total === 0) return null;

    const topBanks = Object.entries(paymentStats.bankDistribution)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    return (
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Top Banks</h4>
        <div className="space-y-3">
          {topBanks.map(([bank, count]) => {
            const percentage = (count / total) * 100;
            return (
              <div key={bank} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm">{getBankIcon(bank)}</span>
                  <span className="text-sm text-gray-700 truncate max-w-[100px]">
                    {bank}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-blue-500 transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-6 text-right">
                    {count}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const QuickMetrics = () => (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <h4 className="text-sm font-semibold text-gray-900 mb-3">
        Quick Metrics
      </h4>
      <div className="grid grid-cols-2 gap-3">
        <div className="text-center p-2 bg-blue-50 rounded-lg">
          <div className="text-lg font-bold text-blue-900">
            {formatCurrency(paymentStats.averageAmount)}
          </div>
          <div className="text-xs text-blue-600">Avg. Payment</div>
        </div>
        <div className="text-center p-2 bg-green-50 rounded-lg">
          <div className="text-lg font-bold text-green-900">
            {paymentStats.totalPayments > 0
              ? Math.round(
                  ((paymentStats.statusCounts.APPROVED || 0) /
                    paymentStats.totalPayments) *
                    100
                )
              : 0}
            %
          </div>
          <div className="text-xs text-green-600">Success Rate</div>
        </div>
        <div className="text-center p-2 bg-purple-50 rounded-lg">
          <div className="text-lg font-bold text-purple-900">
            {paymentStats.totalDiscounts > 0
              ? Math.round(
                  (paymentStats.totalDiscounts / paymentStats.totalRevenue) *
                    100
                )
              : 0}
            %
          </div>
          <div className="text-xs text-purple-600">Discount Rate</div>
        </div>
        <div className="text-center p-2 bg-orange-50 rounded-lg">
          <div className="text-lg font-bold text-orange-900">
            {paymentStats.totalPayments}
          </div>
          <div className="text-xs text-orange-600">Total Txns</div>
        </div>
      </div>
    </div>
  );

  const columns = [
    {
      key: "createdAt",
      header: "Date & Time",
      render: (r) => (
        <div className="flex flex-col min-w-[140px]">
          <span className="text-sm font-medium text-gray-900 whitespace-nowrap">
            {new Date(r.createdAt).toLocaleDateString()}
          </span>
          <span className="text-xs text-gray-500 whitespace-nowrap">
            {new Date(r.createdAt).toLocaleTimeString()}
          </span>
        </div>
      ),
      width: "140px",
    },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <div className="flex items-center space-x-2">
          <div
            className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ${
              r.status === "APPROVED"
                ? "bg-green-50 text-green-700 border-green-200 shadow-sm"
                : r.status === "PENDING"
                ? "bg-yellow-50 text-yellow-700 border-yellow-200 shadow-sm"
                : "bg-red-50 text-red-700 border-red-200 shadow-sm"
            }`}
          >
            <span className="flex items-center">
              {getStatusIcon(r.status)}
              <span className="ml-1.5">{r.status}</span>
            </span>
          </div>
        </div>
      ),
      width: "120px",
    },
    {
      key: "travel",
      header: "Travel Details",
      render: (r) => (
        <div className="flex flex-col min-w-[200px]">
          <span className="text-sm font-semibold text-gray-900 truncate">
            {r.booking?.travel?.title || "Unknown Travel"}
          </span>
          <span className="text-xs text-gray-500 mt-0.5">
            ID: {r.booking?.travelId || "—"}
          </span>
        </div>
      ),
      width: "200px",
    },
    {
      key: "traveler",
      header: "Traveler",
      render: (r) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm">
              <span className="text-xs font-semibold text-white">
                {r.booking?.traveler?.name?.charAt(0)?.toUpperCase() || "T"}
              </span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900">
              {r.booking?.traveler?.name || "Unknown Traveler"}
            </span>
            <span className="text-xs text-gray-500 truncate max-w-[120px]">
              {r.booking?.traveler?.phone || "No phone"}
            </span>
          </div>
        </div>
      ),
      width: "180px",
    },
    {
      key: "bank",
      header: "Bank & Transaction",
      render: (r) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
              <span className="text-sm">{getBankIcon(r.bank)}</span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900">
              {r.bank || "Unknown Bank"}
            </span>
            <span className="text-xs font-mono text-gray-500 bg-gray-50 px-2 py-1 rounded border border-gray-200 mt-1">
              {r.transactionNumber || "No transaction"}
            </span>
          </div>
        </div>
      ),
      width: "200px",
    },
    {
      key: "amount",
      header: "Amount",
      align: "right",
      render: (r) => (
        <div className="flex flex-col items-end space-y-1">
          <span className="text-lg font-bold text-gray-900">
            {formatCurrency(r.finalAmount || 0)}
          </span>
          {r.discountAmount > 0 && (
            <div className="flex items-center space-x-1">
              <span className="text-xs text-red-600 font-medium bg-red-50 px-2 py-1 rounded-full border border-red-200">
                -{formatCurrency(r.discountAmount)}
              </span>
            </div>
          )}
        </div>
      ),
      width: "130px",
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Loading skeleton remains the same */}
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
            <div className="h-4 bg-gray-100 rounded w-64 mt-2 animate-pulse"></div>
          </div>
          <div className="h-6 bg-gray-200 rounded w-24 animate-pulse"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-100 p-6 rounded-xl animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-24"></div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="h-16 bg-gray-100 animate-pulse"></div>
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex items-center space-x-4 animate-pulse"
              >
                <div className="h-12 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Payment Analytics
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Comprehensive view of payment transactions and performance metrics
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-gray-500">Total Payments</p>
            <p className="text-lg font-semibold text-gray-900">
              {payments.total}
            </p>
          </div>
          <div className="w-px h-8 bg-gray-300"></div>
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
            Real-time Data
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700 mb-1">
                Total Revenue
              </p>
              <p className="text-2xl font-bold text-blue-900">
                {formatCurrency(paymentStats.totalRevenue)}
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
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700 mb-1">
                Approved
              </p>
              <p className="text-2xl font-bold text-green-900">
                {paymentStats.statusCounts.APPROVED || 0}
              </p>
              <p className="text-xs text-green-600 mt-1">
                {payments.total > 0
                  ? Math.round(
                      ((paymentStats.statusCounts.APPROVED || 0) /
                        payments.total) *
                        100
                    )
                  : 0}
                % of total
              </p>
            </div>
            <div className="p-3 bg-white rounded-lg shadow-sm">
              <svg
                className="w-6 h-6 text-green-600"
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
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-xl border border-yellow-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-700 mb-1">
                Pending
              </p>
              <p className="text-2xl font-bold text-yellow-900">
                {paymentStats.statusCounts.PENDING || 0}
              </p>
              <p className="text-xs text-yellow-600 mt-1">
                {payments.total > 0
                  ? Math.round(
                      ((paymentStats.statusCounts.PENDING || 0) /
                        payments.total) *
                        100
                    )
                  : 0}
                % of total
              </p>
            </div>
            <div className="p-3 bg-white rounded-lg shadow-sm">
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
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl border border-red-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-700 mb-1">
                Total Discounts
              </p>
              <p className="text-2xl font-bold text-red-900">
                {formatCurrency(paymentStats.totalDiscounts)}
              </p>
              <p className="text-xs text-red-600 mt-1">
                {paymentStats.totalRevenue > 0
                  ? Math.round(
                      (paymentStats.totalDiscounts /
                        paymentStats.totalRevenue) *
                        100
                    )
                  : 0}
                % of revenue
              </p>
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
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V4a2 2 0 10-4 0v2h4z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Simple Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueTrend />
        <StatusDistribution />
        <BankDistribution />
        <QuickMetrics />
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Payment Transactions
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Detailed view of all payment activities
              </p>
            </div>
            <div className="mt-3 sm:mt-0 flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Showing {payments.items.length} of {payments.total}
              </div>
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {paymentStats.statusCounts.APPROVED || 0} Approved
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  {paymentStats.statusCounts.PENDING || 0} Pending
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  {paymentStats.statusCounts.REJECTED || 0} Rejected
                </span>
              </div>
            </div>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={payments.items}
          total={payments.total}
          page={payments.page}
          limit={payments.limit}
          onPageChange={onPageChange}
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
                No Payment Records
              </h4>
              <p className="text-gray-500 max-w-sm mx-auto">
                No payment transactions found for the selected filters. Payments
                will appear here once travelers complete their transactions.
              </p>
            </div>
          }
          textClass="text-gray-700"
          compact={false}
          hover={true}
          striped={true}
        />
      </div>
    </div>
  );
};

export default PaymentsSection;
