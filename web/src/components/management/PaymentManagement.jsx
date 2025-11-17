import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Button from "../../components/ui/Button";
import { getBooking } from "../../services/bookingService";
import {
  getPayments,
  updatePaymentStatus,
} from "../../services/paymentService";
import FormDialog from "../../ui/FormDialog";
import { paymentStatusOptions } from "../../utils/dummyData";

const PaymentManagement = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentPayment, setCurrentPayment] = useState(null);
  const [filter, setFilter] = useState("PENDING");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [payments, setPayments] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortField, setSortField] = useState("id");
  const [sortDir, setSortDir] = useState("desc");
  const [rejectingPayment, setRejectingPayment] = useState(null);
  const [rejectionMessage, setRejectionMessage] = useState("");
  const [rejectLoading, setRejectLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const dropdownRefs = useRef({});

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = filter === "all" ? {} : { status: filter };
      const res = await getPayments(params);
      setPayments(res.data || []);
    } catch (e) {
      setError(e.message || "Failed to load payments");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownOpen &&
        !dropdownRefs.current[dropdownOpen]?.contains(event.target)
      ) {
        setDropdownOpen(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  // Statistics
  const stats = useMemo(() => {
    const total = payments.length;
    const pending = payments.filter((p) => p.status === "PENDING").length;
    const approved = payments.filter((p) => p.status === "APPROVED").length;
    const rejected = payments.filter((p) => p.status === "REJECTED").length;
    const totalAmount = payments.reduce(
      (sum, p) => sum + (p.finalAmount || p.originalAmount || 0),
      0
    );

    return { total, pending, approved, rejected, totalAmount };
  }, [payments]);

  // Filter and search
  const filteredPayments = useMemo(() => {
    let result = payments;

    // Status filter
    if (filter !== "all") {
      result = result.filter((payment) => payment.status === filter);
    }

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (payment) =>
          payment.id?.toString().includes(searchLower) ||
          payment.bookingId?.toString().includes(searchLower) ||
          payment.bank?.toLowerCase().includes(searchLower) ||
          payment.transactionNumber?.toLowerCase().includes(searchLower) ||
          payment.couponCode?.toLowerCase().includes(searchLower)
      );
    }

    return result;
  }, [payments, filter, search]);

  // Sort
  const sortedPayments = useMemo(() => {
    const data = [...filteredPayments];
    data.sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      let av = a[sortField];
      let bv = b[sortField];

      // Handle nested fields and dates
      if (sortField === "createdAt" || sortField === "updatedAt") {
        av = new Date(av);
        bv = new Date(bv);
      }

      if (typeof av === "string") av = av.toLowerCase();
      if (typeof bv === "string") bv = bv.toLowerCase();
      if (av === bv) return 0;
      return av > bv ? dir : -dir;
    });
    return data;
  }, [filteredPayments, sortField, sortDir]);

  // Pagination
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(sortedPayments.length / limit)),
    [sortedPayments.length, limit]
  );

  const paginatedPayments = useMemo(() => {
    const startIndex = (page - 1) * limit;
    return sortedPayments.slice(startIndex, startIndex + limit);
  }, [sortedPayments, page, limit]);

  const handleView = async (payment) => {
    try {
      const bookingRes = await getBooking(payment.bookingId);
      setCurrentPayment({ ...payment, booking: bookingRes.data });
      setIsDialogOpen(true);
      setDropdownOpen(null); // Close dropdown
    } catch (e) {
      setError(e.message || "Failed to load booking details");
    }
  };

  const handleApprove = async (payment) => {
    if (!window.confirm(`Approve payment #${payment.id}?`)) return;
    try {
      await updatePaymentStatus(payment.id, { status: "APPROVED" });
      setDropdownOpen(null); // Close dropdown
      await load();
    } catch (e) {
      setError(e.message || "Failed to approve payment");
    }
  };

  const startReject = (payment) => {
    setRejectingPayment(payment);
    setRejectionMessage("");
    setIsDialogOpen(true);
    setDropdownOpen(null); // Close dropdown
  };

  const submitReject = async () => {
    if (!rejectingPayment) return;
    if (!window.confirm(`Reject payment #${rejectingPayment.id}?`)) return;
    try {
      setRejectLoading(true);
      await updatePaymentStatus(rejectingPayment.id, {
        status: "REJECTED",
        message: rejectionMessage.trim() || undefined,
      });
      setIsDialogOpen(false);
      setRejectingPayment(null);
      await load();
    } catch (e) {
      setError(e.message || "Failed to reject payment");
    } finally {
      setRejectLoading(false);
    }
  };

  const changeSort = (field) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const headerCell = (label, field) => (
    <th
      className="p-4 cursor-pointer select-none group transition-colors duration-150 hover:bg-gray-100"
      onClick={() => changeSort(field)}
    >
      <div className="flex items-center gap-2 font-semibold text-gray-700">
        <span>{label}</span>
        <div className="flex flex-col">
          {sortField === field ? (
            <span className="text-xs text-blue-600">
              {sortDir === "asc" ? "▲" : "▼"}
            </span>
          ) : (
            <span className="opacity-0 group-hover:opacity-60 text-xs text-gray-400">
              ⇅
            </span>
          )}
        </div>
      </div>
    </th>
  );

  const toggleDropdown = (paymentId) => {
    setDropdownOpen(dropdownOpen === paymentId ? null : paymentId);
  };

  const paymentActions = [
    {
      label: "Approve",
      onClick: handleApprove,
      icon: "✓",
      className: "text-green-700 hover:bg-green-50 hover:text-green-900",
      show: (p) => p.status === "PENDING",
    },
    {
      label: "Reject",
      onClick: startReject,
      icon: "✕",
      className: "text-red-700 hover:bg-red-50 hover:text-red-900",
      show: (p) => p.status === "PENDING",
    },
    {
      label: "View Details",
      onClick: handleView,
      icon: "👁",
      className: "text-blue-700 hover:bg-blue-50 hover:text-blue-900",
      show: () => true,
    },
  ];

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">
              Payment Management
            </h1>
            <p className="text-gray-600 text-lg">
              Review and manage payment approvals
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-4 w-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search payments..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64 bg-gray-50 transition-colors duration-200"
              />
            </div>

            <select
              value={limit}
              onChange={(e) => {
                setLimit(parseInt(e.target.value));
                setPage(1);
              }}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 transition-colors duration-200"
            >
              {[10, 20, 50].map((n) => (
                <option key={n} value={n}>
                  {n} per page
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mt-6 flex flex-wrap gap-2">
          <button
            onClick={() => {
              setFilter("all");
              setPage(1);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              filter === "all"
                ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            All Payments
          </button>
          {paymentStatusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                setFilter(option.value);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                filter === option.value
                  ? option.value === "PENDING"
                    ? "bg-yellow-500 text-white shadow-md shadow-yellow-200"
                    : option.value === "APPROVED"
                    ? "bg-green-500 text-white shadow-md shadow-green-200"
                    : "bg-red-500 text-white shadow-md shadow-red-200"
                  : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Statistical Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "Total Payments",
            value: stats.total,
            color: "blue",
            icon: "💰",
          },
          {
            label: "Pending",
            value: stats.pending,
            color: "yellow",
            icon: "⏳",
          },
          {
            label: "Approved",
            value: stats.approved,
            color: "green",
            icon: "✅",
          },
          {
            label: "Rejected",
            value: stats.rejected,
            color: "red",
            icon: "❌",
          },
        ].map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 transition-all duration-300 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {stat.label}
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stat.value}
                </p>
              </div>
              <div className={`p-3 rounded-xl bg-${stat.color}-50`}>
                <span className="text-2xl">{stat.icon}</span>
              </div>
            </div>
            <div className="mt-4">
              <div
                className={`h-2 bg-${stat.color}-100 rounded-full overflow-hidden`}
              >
                <div
                  className={`h-full bg-${stat.color}-500 rounded-full transition-all duration-1000`}
                  style={{
                    width: `${
                      stats.total ? (stat.value / stats.total) * 100 : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-red-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <p className="text-red-700 text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Data Grid */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {headerCell("ID", "id")}
                {headerCell("Booking", "bookingId")}
                {headerCell("Bank", "bank")}
                {headerCell("Transaction", "transactionNumber")}
                {headerCell("Coupon", "couponCode")}
                {headerCell("Amount", "finalAmount")}
                {headerCell("Status", "status")}
                {headerCell("Created", "createdAt")}
                <th className="p-4 font-semibold text-gray-700 text-left w-48">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td className="p-8 text-center" colSpan={9}>
                    <div className="flex flex-col items-center gap-3">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <p className="text-gray-600 font-medium">
                        Loading payments...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : paginatedPayments.length ? (
                paginatedPayments.map((payment, index) => (
                  <tr
                    key={payment.id}
                    className="transition-colors duration-150 hover:bg-blue-50/50 group"
                  >
                    <td className="p-4">
                      <span className="font-mono text-sm font-semibold text-gray-900 bg-gray-100 px-2 py-1 rounded-md">
                        #{payment.id}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="font-medium text-gray-900">
                        Booking #{payment.bookingId}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-gray-700">
                        {payment.bank || "—"}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="font-mono text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded">
                        {payment.transactionNumber || "—"}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-gray-700">
                        {payment.couponCode || "—"}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-gray-900 text-lg">
                        {payment.finalAmount != null
                          ? `$${payment.finalAmount}`
                          : payment.originalAmount != null
                          ? `$${payment.originalAmount}`
                          : "—"}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${
                          payment.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                            : payment.status === "APPROVED"
                            ? "bg-green-100 text-green-800 border border-green-200"
                            : "bg-red-100 text-red-800 border border-red-200"
                        }`}
                      >
                        {payment.status === "PENDING" && "⏳ "}
                        {payment.status === "APPROVED" && "✅ "}
                        {payment.status === "REJECTED" && "❌ "}
                        {
                          paymentStatusOptions.find(
                            (o) => o.value === payment.status
                          )?.label
                        }
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">
                          {new Date(payment.createdAt).toLocaleDateString()}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(payment.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div
                        className="relative"
                        ref={(el) => (dropdownRefs.current[payment.id] = el)}
                      >
                        <button
                          type="button"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-white text-sm font-medium text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-sm"
                          onClick={() => toggleDropdown(payment.id)}
                        >
                          <span>Actions</span>
                          <span className="text-gray-400">▾</span>
                        </button>

                        {dropdownOpen === payment.id && (
                          <div className="absolute right-0 z-20 mt-2 w-56 rounded-xl border border-gray-200 bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden">
                            <div className="py-1">
                              {paymentActions
                                .filter(
                                  (action) =>
                                    !action.show || action.show(payment)
                                )
                                .map((action, idx) => (
                                  <button
                                    key={idx}
                                    className={`flex items-center gap-3 w-full px-4 py-3 text-sm transition-all duration-150 ${action.className}`}
                                    onClick={() => action.onClick(payment)}
                                  >
                                    <span className="text-base">
                                      {action.icon}
                                    </span>
                                    <span className="font-medium">
                                      {action.label}
                                    </span>
                                  </button>
                                ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="p-8 text-center" colSpan={9}>
                    <div className="flex flex-col items-center gap-3 text-gray-500">
                      <svg
                        className="h-12 w-12"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <p className="text-lg font-medium">No payments found</p>
                      <p className="text-sm">
                        Try adjusting your search or filter criteria
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="text-sm text-gray-600">
            <span className="font-semibold text-gray-900">
              Page {page} of {totalPages}
            </span>
            {" • "}
            <span>Total {sortedPayments.length} payments</span>
            {" • "}
            <span>Showing {paginatedPayments.length} items</span>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <Button
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(1)}
              variant="outline"
            >
              « First
            </Button>
            <Button
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              variant="outline"
            >
              ‹ Prev
            </Button>

            <div className="flex gap-1 mx-2">
              {Array.from({ length: totalPages })
                .slice(0, 7)
                .map((_, i) => {
                  const num = i + 1;
                  if (totalPages > 7 && num === 6 && page < totalPages - 2) {
                    return (
                      <span key="ellipsis" className="px-3 py-2 text-gray-400">
                        …
                      </span>
                    );
                  }
                  if (
                    totalPages > 7 &&
                    page >= totalPages - 2 &&
                    num <= totalPages - 5
                  ) {
                    return null;
                  }
                  return (
                    <button
                      key={num}
                      onClick={() => setPage(num)}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                        page === num
                          ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                          : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {num}
                    </button>
                  );
                })}
            </div>

            <Button
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              variant="outline"
            >
              Next ›
            </Button>
            <Button
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage(totalPages)}
              variant="outline"
            >
              Last »
            </Button>
          </div>
        </div>
      </div>

      {/* Rejection Dialog */}
      {rejectingPayment && (
        <FormDialog
          isOpen={isDialogOpen}
          onClose={() => {
            if (!rejectLoading) {
              setIsDialogOpen(false);
              setRejectingPayment(null);
            }
          }}
          title={
            <div className="flex items-center gap-2">
              <span className="text-red-600">❌</span>
              <span>Reject Payment #{rejectingPayment.id}</span>
            </div>
          }
          onSubmit={submitReject}
          submitLabel={rejectLoading ? "Rejecting..." : "Confirm Rejection"}
          disableSubmit={rejectLoading}
          submitVariant="danger"
          size="lg"
        >
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Rejection Message (optional)
              </label>
              <textarea
                rows={4}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                placeholder="Please provide a reason for rejection..."
                value={rejectionMessage}
                onChange={(e) => setRejectionMessage(e.target.value)}
              />
              <p className="mt-2 text-xs text-gray-500">
                This message will be visible to the traveler and help them
                understand why the payment was rejected.
              </p>
            </div>

            <div className="border border-gray-200 rounded-xl p-4 bg-gray-50 space-y-3">
              <h4 className="font-semibold text-gray-700 text-sm">
                Payment Details
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Traveler:</span>
                  <p className="font-medium text-gray-900">
                    {rejectingPayment.booking?.traveler?.name ||
                      rejectingPayment.booking?.traveler?.phone ||
                      "Unknown"}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Travel:</span>
                  <p className="font-medium text-gray-900">
                    {rejectingPayment.booking?.travel?.title ||
                      `#${rejectingPayment.booking?.travel?.id}`}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Transaction:</span>
                  <p className="font-mono text-gray-900">
                    {rejectingPayment.transactionNumber || "—"}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Bank:</span>
                  <p className="font-medium text-gray-900">
                    {rejectingPayment.bank || "—"}
                  </p>
                </div>
              </div>
            </div>

            {rejectingPayment.receiptUrl && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">
                  Receipt Preview
                </h4>
                <div className="border border-gray-200 rounded-xl p-4 bg-white">
                  <img
                    src={rejectingPayment.receiptUrl}
                    alt="Payment Receipt"
                    className="max-h-64 rounded-lg border object-contain mx-auto"
                  />
                </div>
              </div>
            )}
          </div>
        </FormDialog>
      )}

      {/* View Details Dialog */}
      {currentPayment && !rejectingPayment && (
        <FormDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          title={
            <div className="flex items-center gap-2">
              <span className="text-blue-600">👁</span>
              <span>Payment Details #{currentPayment.id}</span>
            </div>
          }
          size="xl"
        >
          <div className="space-y-6">
            {/* Header Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-blue-700 mb-1">
                  Booking ID
                </h3>
                <p className="text-2xl font-bold text-blue-900">
                  #{currentPayment.bookingId}
                </p>
              </div>
              <div className="bg-green-50 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-green-700 mb-1">
                  Status
                </h3>
                <p className="text-lg">
                  <span
                    className={`px-3 py-1.5 rounded-full text-sm font-semibold ${
                      currentPayment.status === "PENDING"
                        ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                        : currentPayment.status === "APPROVED"
                        ? "bg-green-100 text-green-800 border border-green-200"
                        : "bg-red-100 text-red-800 border border-red-200"
                    }`}
                  >
                    {currentPayment.status === "PENDING" && "⏳ "}
                    {currentPayment.status === "APPROVED" && "✅ "}
                    {currentPayment.status === "REJECTED" && "❌ "}
                    {
                      paymentStatusOptions.find(
                        (o) => o.value === currentPayment.status
                      )?.label
                    }
                  </span>
                </p>
              </div>
              <div className="bg-purple-50 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-purple-700 mb-1">
                  Total Amount
                </h3>
                <p className="text-2xl font-bold text-purple-900">
                  {currentPayment.finalAmount != null
                    ? `$${currentPayment.finalAmount}`
                    : currentPayment.originalAmount != null
                    ? `$${currentPayment.originalAmount}`
                    : "—"}
                </p>
              </div>
            </div>

            {/* Amount Breakdown */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Amount Breakdown
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="text-center p-3 bg-white rounded-lg border">
                  <div className="text-gray-500">Original Amount</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {currentPayment.originalAmount != null
                      ? `$${currentPayment.originalAmount}`
                      : "—"}
                  </div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border">
                  <div className="text-gray-500">Discount</div>
                  <div className="text-lg font-semibold text-red-600">
                    {currentPayment.discountAmount != null
                      ? `- $${currentPayment.discountAmount}`
                      : "—"}
                  </div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border border-blue-200">
                  <div className="text-blue-600 font-medium">Final Amount</div>
                  <div className="text-xl font-bold text-blue-700">
                    {currentPayment.finalAmount != null
                      ? `$${currentPayment.finalAmount}`
                      : currentPayment.originalAmount != null
                      ? `$${currentPayment.originalAmount}`
                      : "—"}
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">
                    Coupon Information
                  </h3>
                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="text-sm">
                      <span className="text-gray-500">Code:</span>{" "}
                      <span className="font-mono text-gray-900">
                        {currentPayment.couponCode || "No coupon used"}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">
                    Payment Method
                  </h3>
                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="text-sm space-y-2">
                      <div>
                        <span className="text-gray-500">Bank:</span>{" "}
                        <span className="font-medium text-gray-900">
                          {currentPayment.bank || "—"}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Transaction:</span>{" "}
                        <span className="font-mono text-gray-900">
                          {currentPayment.transactionNumber || "—"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Receipt */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Payment Receipt
                </h3>
                <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-6 flex justify-center items-center min-h-[200px]">
                  {currentPayment.receiptUrl ? (
                    <img
                      src={currentPayment.receiptUrl}
                      alt="Payment Receipt"
                      className="rounded-lg max-h-64 object-contain shadow-sm"
                    />
                  ) : (
                    <div className="text-center text-gray-500">
                      <svg
                        className="h-12 w-12 mx-auto mb-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <p className="text-sm">No receipt uploaded</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tickets Section */}
            {currentPayment.booking?.tickets?.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Tickets ({currentPayment.booking.tickets.length})
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {currentPayment.booking.tickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm space-y-3"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {ticket.name}
                          </h4>
                          <p className="text-sm text-gray-500">
                            Age: {ticket.age}
                          </p>
                        </div>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                          Badge: {ticket.badgeNumber}
                        </span>
                      </div>
                      {ticket.qrCodeUrl && (
                        <div className="text-center">
                          <img
                            src={ticket.qrCodeUrl}
                            alt="Ticket QR Code"
                            className="w-32 h-32 mx-auto border rounded-lg"
                          />
                          <button
                            className="mt-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
                            onClick={() => {
                              const link = document.createElement("a");
                              link.href = ticket.qrCodeUrl;
                              link.download = `ticket-${ticket.id}.png`;
                              link.click();
                            }}
                          >
                            Download QR Code
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </FormDialog>
      )}
    </div>
  );
};

export default PaymentManagement;
