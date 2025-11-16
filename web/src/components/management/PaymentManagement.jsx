import React, { useEffect, useState } from "react";
import DataGrid from "../../ui/DataGrid";
import FormDialog from "../../ui/FormDialog";
import { paymentStatusOptions } from "../../utils/dummyData";
import {
  getPayments,
  updatePaymentStatus,
} from "../../services/paymentService";
import { getBooking } from "../../services/bookingService";

const PaymentManagement = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentPayment, setCurrentPayment] = useState(null);
  // Default to PENDING per requirement
  const [filter, setFilter] = useState("PENDING");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        // When "all" is selected, omit status param to fetch every payment
        const params = filter === "all" ? {} : { status: filter };
        const res = await getPayments(params);
        setPayments(res.data || []);
      } catch (e) {
        setError(e.message || "Failed to load payments");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [filter]);

  const handleView = async (payment) => {
    try {
      // fetch booking for richer detail (tickets if approved)
      const bookingRes = await getBooking(payment.bookingId);
      setCurrentPayment({ ...payment, booking: bookingRes.data });
      setIsDialogOpen(true);
    } catch (e) {
      alert(e.message || "Failed to load booking details");
    }
  };

  const handleApprove = async (payment) => {
    if (!window.confirm(`Approve payment #${payment.id}?`)) return;
    try {
      await updatePaymentStatus(payment.id, { status: "APPROVED" });
      const res = await getPayments({ status: filter });
      setPayments(res.data || []);
    } catch (e) {
      alert(e.message || "Failed to approve payment");
    }
  };

  const [rejectingPayment, setRejectingPayment] = useState(null);
  const [rejectionMessage, setRejectionMessage] = useState("");
  const [rejectLoading, setRejectLoading] = useState(false);

  const startReject = (payment) => {
    setRejectingPayment(payment);
    setRejectionMessage("");
    setIsDialogOpen(true);
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
      const res = await getPayments({ status: filter });
      setPayments(res.data || []);
    } catch (e) {
      alert(e.message || "Failed to reject payment");
    } finally {
      setRejectLoading(false);
    }
  };

  const filteredPayments =
    filter === "all" ? payments : payments.filter((p) => p.status === filter);

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
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Payment Management</h2>
        <div className="flex space-x-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1"
          >
            <option value="all">All Statuses</option>
            {paymentStatusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <div className="text-red-600 text-sm">{error}</div>}
      {loading ? (
        <div className="p-6 text-gray-500">Loading payments...</div>
      ) : (
        <DataGrid
          headers={[
            "ID",
            "Booking",
            "Bank",
            "Transaction",
            "Status",
            "Created",
          ]}
          rows={filteredPayments.map((payment) => ({
            data: payment,
            cells: [
              `#${payment.id}`,
              `Booking #${payment.bookingId}`,
              payment.bank || "—",
              payment.transactionNumber || "—",
              <span
                className={`px-2 py-1 rounded-full text-xs ${
                  payment.status === "PENDING"
                    ? "bg-yellow-100 text-yellow-800"
                    : payment.status === "APPROVED"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {
                  paymentStatusOptions.find((o) => o.value === payment.status)
                    ?.label
                }
              </span>,
              new Date(payment.createdAt).toLocaleDateString(),
            ],
          }))}
          actions={paymentActions}
        />
      )}

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
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
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
                <h3 className="text-sm font-medium text-gray-500">Amount</h3>
                <p className="text-lg">
                  {currentPayment.amount ? `$${currentPayment.amount}` : "—"}
                </p>
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
                          // simple image download fallback
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
