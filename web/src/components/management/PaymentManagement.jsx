import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import DataGrid from "../../ui/DataGrid";
import FormDialog from "../../ui/FormDialog";
import Button from "../../components/ui/Button";
import { paymentStatusOptions } from "../../utils/dummyData";
import {
  getPayments,
  updatePaymentStatus,
} from "../../services/paymentService";
import { getBooking } from "../../services/bookingService";

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
      className="p-3 cursor-pointer select-none group"
      onClick={() => changeSort(field)}
    >
      <div className="flex items-center gap-1">
        <span>{label}</span>
        {sortField === field && (
          <span className="text-xs text-gray-500">
            {sortDir === "asc" ? "▲" : "▼"}
          </span>
        )}
        {sortField !== field && (
          <span className="opacity-0 group-hover:opacity-60 text-xs text-gray-400">
            ⇅
          </span>
        )}
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
      className: "text-green-600 hover:text-green-900",
      show: (p) => p.status === "PENDING",
    },
    {
      label: "Reject",
      onClick: startReject,
      className: "text-red-600 hover:text-red-900",
      show: (p) => p.status === "PENDING",
    },
    {
      label: "View",
      onClick: handleView,
      show: (p) => p.status !== "PENDING",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Payment Management
          </h2>
          <p className="text-sm text-gray-600">
            Review and manage payment approvals
          </p>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <input
            type="text"
            placeholder="Search payments..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="border border-gray-300 rounded-md px-3 py-2 w-56 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setFilter("all");
                setPage(1);
              }}
              className={`px-3 py-1 rounded-full text-xs font-medium border ${
                filter === "all"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-600 border-gray-300"
              }`}
            >
              All
            </button>
            {paymentStatusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setFilter(option.value);
                  setPage(1);
                }}
                className={`px-3 py-1 rounded-full text-xs font-medium border ${
                  filter === option.value
                    ? option.value === "PENDING"
                      ? "bg-yellow-600 text-white border-yellow-600"
                      : option.value === "APPROVED"
                      ? "bg-green-600 text-white border-green-600"
                      : "bg-red-600 text-white border-red-600"
                    : "bg-white text-gray-600 border-gray-300"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <select
            value={limit}
            onChange={(e) => {
              setLimit(parseInt(e.target.value));
              setPage(1);
            }}
            className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {[10, 20, 50].map((n) => (
              <option key={n} value={n}>
                {n}/page
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Statistical Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
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
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-600">
                Total Payments
              </h3>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
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
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-600">Pending</h3>
              <p className="text-2xl font-bold text-gray-900">
                {stats.pending}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
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
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-600">Approved</h3>
              <p className="text-2xl font-bold text-gray-900">
                {stats.approved}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
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
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-600">Rejected</h3>
              <p className="text-2xl font-bold text-gray-900">
                {stats.rejected}
              </p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-700 bg-red-50 px-3 py-2 rounded border border-red-200">
          {error}
        </div>
      )}

      {/* Data Grid with Fixed Dropdown */}
      <div className="bg-white shadow rounded overflow-auto max-h-[70vh]">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-gray-600 border-b sticky top-0 bg-gray-50 shadow-sm">
              {headerCell("ID", "id")}
              {headerCell("Booking", "bookingId")}
              {headerCell("Bank", "bank")}
              {headerCell("Transaction", "transactionNumber")}
              {headerCell("Coupon", "couponCode")}
              {headerCell("Amount", "finalAmount")}
              {headerCell("Status", "status")}
              {headerCell("Created", "createdAt")}
              <th className="p-3 w-40">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="p-4 text-center" colSpan={9}>
                  Loading payments...
                </td>
              </tr>
            ) : paginatedPayments.length ? (
              paginatedPayments.map((payment, index) => (
                <tr
                  key={payment.id}
                  className={`border-b hover:bg-blue-50 transition-colors ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  <td className="p-3 font-mono text-xs">#{payment.id}</td>
                  <td className="p-3">Booking #{payment.bookingId}</td>
                  <td className="p-3">{payment.bank || "—"}</td>
                  <td className="p-3 font-mono text-xs">
                    {payment.transactionNumber || "—"}
                  </td>
                  <td className="p-3">{payment.couponCode || "—"}</td>
                  <td className="p-3 font-medium">
                    {payment.finalAmount != null
                      ? `$${payment.finalAmount}`
                      : payment.originalAmount != null
                      ? `$${payment.originalAmount}`
                      : "—"}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        payment.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-800"
                          : payment.status === "APPROVED"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {
                        paymentStatusOptions.find(
                          (o) => o.value === payment.status
                        )?.label
                      }
                    </span>
                  </td>
                  <td className="p-3 text-gray-500">
                    {new Date(payment.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-3">
                    <div
                      className="relative inline-block text-left"
                      ref={(el) => (dropdownRefs.current[payment.id] = el)}
                    >
                      <button
                        type="button"
                        className="inline-flex justify-center w-full px-3 py-1.5 bg-white text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-blue-500"
                        onClick={() => toggleDropdown(payment.id)}
                      >
                        Actions ▾
                      </button>

                      {dropdownOpen === payment.id && (
                        <div className="absolute right-0 z-10 mt-2 w-40 rounded-md border border-gray-200 bg-white shadow-lg p-1">
                          {paymentActions
                            .filter(
                              (action) => !action.show || action.show(payment)
                            )
                            .map((action, idx) => (
                              <button
                                key={idx}
                                className={`w-full text-left px-3 py-2 text-xs rounded hover:bg-gray-100 ${
                                  action.className || ""
                                }`}
                                onClick={() => action.onClick(payment)}
                              >
                                {action.label}
                              </button>
                            ))}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="p-4 text-center" colSpan={9}>
                  No payments found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="text-xs text-gray-600">
          Page {page} / {totalPages} • Total {sortedPayments.length} • Showing{" "}
          {paginatedPayments.length} items
        </div>
        <div className="flex flex-wrap gap-1 items-center">
          <Button size="sm" disabled={page === 1} onClick={() => setPage(1)}>
            « First
          </Button>
          <Button
            size="sm"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            ‹ Prev
          </Button>
          {Array.from({ length: totalPages })
            .slice(0, 7)
            .map((_, i) => {
              const num = i + 1;
              if (totalPages > 7 && num === 6 && page < totalPages - 2) {
                return (
                  <span key="ellipsis" className="px-2 text-gray-400">
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
                  className={`px-3 py-1 text-xs rounded border ${
                    page === num
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-600 border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  {num}
                </button>
              );
            })}
          <Button
            size="sm"
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next ›
          </Button>
          <Button
            size="sm"
            disabled={page === totalPages}
            onClick={() => setPage(totalPages)}
          >
            Last »
          </Button>
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
          title={`Reject Payment #${rejectingPayment.id}`}
          onSubmit={submitReject}
          submitLabel={rejectLoading ? "Rejecting..." : "Confirm Reject"}
          disableSubmit={rejectLoading}
          submitVariant="danger"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rejection Message (optional)
              </label>
              <textarea
                rows={4}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Reason for rejection"
                value={rejectionMessage}
                onChange={(e) => setRejectionMessage(e.target.value)}
              />
              <p className="mt-1 text-xs text-gray-500">
                This message will be visible to the traveler.
              </p>
            </div>
            <div className="border rounded-md p-3 bg-gray-50 text-xs text-gray-600">
              <p>
                <span className="font-semibold">Traveler:</span>{" "}
                {rejectingPayment.booking?.traveler?.name ||
                  rejectingPayment.booking?.traveler?.phone ||
                  "Unknown"}
              </p>
              <p>
                <span className="font-semibold">Travel:</span>{" "}
                {rejectingPayment.booking?.travel?.title ||
                  `#${rejectingPayment.booking?.travel?.id}`}
              </p>
              <p>
                <span className="font-semibold">Transaction:</span>{" "}
                {rejectingPayment.transactionNumber || "—"}
              </p>
              <p>
                <span className="font-semibold">Bank:</span>{" "}
                {rejectingPayment.bank || "—"}
              </p>
            </div>
            {rejectingPayment.receiptUrl && (
              <div>
                <h4 className="text-xs font-semibold text-gray-600 mb-1">
                  Receipt Preview
                </h4>
                <img
                  src={rejectingPayment.receiptUrl}
                  alt="Receipt"
                  className="max-h-48 rounded-md border object-contain"
                />
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
          title={`Payment Details #${currentPayment.id}`}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Booking</h3>
                <p className="text-lg">#{currentPayment.bookingId}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Amounts</h3>
                <div className="text-sm space-y-1">
                  <div>
                    <span className="text-gray-500">Original:</span>{" "}
                    {currentPayment.originalAmount != null
                      ? `$${currentPayment.originalAmount}`
                      : "—"}
                  </div>
                  <div>
                    <span className="text-gray-500">Discount:</span>{" "}
                    {currentPayment.discountAmount != null
                      ? `- $${currentPayment.discountAmount}`
                      : "—"}
                  </div>
                  <div>
                    <span className="text-gray-700 font-medium">Final:</span>{" "}
                    {currentPayment.finalAmount != null
                      ? `$${currentPayment.finalAmount}`
                      : currentPayment.originalAmount != null
                      ? `$${currentPayment.originalAmount}`
                      : "—"}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Status</h3>
              <p className="text-lg">
                <span
                  className={`px-2 py-1 rounded-full ${
                    currentPayment.status === "PENDING"
                      ? "bg-yellow-100 text-yellow-800"
                      : currentPayment.status === "APPROVED"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {
                    paymentStatusOptions.find(
                      (o) => o.value === currentPayment.status
                    )?.label
                  }
                </span>
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Coupon</h3>
              <div className="mt-1 text-sm">
                <div>
                  <span className="text-gray-500">Code:</span>{" "}
                  {currentPayment.couponCode || "—"}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Receipt</h3>
              <div className="mt-2 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-4 flex justify-center">
                {currentPayment.receiptUrl ? (
                  <img
                    src={currentPayment.receiptUrl}
                    alt="Receipt"
                    className="rounded-xl max-h-48 object-contain"
                  />
                ) : (
                  <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-48 flex items-center justify-center">
                    <span className="text-gray-500">No receipt uploaded</span>
                  </div>
                )}
              </div>
            </div>

            {currentPayment.booking?.tickets?.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Tickets
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {currentPayment.booking.tickets.map((t) => (
                    <div
                      key={t.id}
                      className="border rounded-lg p-3 bg-white shadow-sm space-y-2"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-700">
                          {t.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          Age {t.age}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        Badge: {t.badgeNumber}
                      </div>
                      {t.qrCodeUrl && (
                        <img
                          src={t.qrCodeUrl}
                          alt="QR"
                          className="w-28 h-28 mx-auto"
                        />
                      )}
                      <button
                        className="mt-2 w-full text-center text-sm font-medium text-indigo-600 hover:text-indigo-800"
                        onClick={() => {
                          const link = document.createElement("a");
                          link.href = t.qrCodeUrl || "#";
                          link.download = `ticket-${t.id}.png`;
                          link.click();
                        }}
                      >
                        Download QR
                      </button>
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
