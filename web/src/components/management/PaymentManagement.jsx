import React, { useState } from "react";
import DataGrid from "../../ui/DataGrid";
import FormDialog from "../../ui/FormDialog";
import {
  payments,
  bookings,
  paymentStatusOptions,
} from "../../utils/dummyData";

const PaymentManagement = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentPayment, setCurrentPayment] = useState(null);
  const [filter, setFilter] = useState("all");

  const handleView = (payment) => {
    setCurrentPayment(payment);
    setIsDialogOpen(true);
  };

  const handleStatusChange = (payment, status) => {
    console.log(`Change payment #${payment.id} status to ${status}`);
    alert(`Payment status changed to ${status}`);
  };

  const filteredPayments =
    filter === "all" ? payments : payments.filter((p) => p.status === filter);

  const paymentActions = [
    {
      label: "Approve",
      onClick: (p) => handleStatusChange(p, "APPROVED"),
      className: "text-green-600 hover:text-green-900",
      show: (p) => p.status === "PENDING",
    },
    {
      label: "Reject",
      onClick: (p) => handleStatusChange(p, "REJECTED"),
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

      <DataGrid
        headers={["ID", "Booking", "Amount", "Status"]}
        rows={filteredPayments.map((payment) => [
          `#${payment.id}`,
          `Booking #${payment.bookingId}`,
          `$${payment.amount}`,
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
        ])}
        actions={paymentActions.filter((action) => {
          // !action.show || action.show(payment);
        })}
      />

      {currentPayment && (
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
                <p className="text-lg">${currentPayment.amount}</p>
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
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-48 flex items-center justify-center">
                  <span className="text-gray-500">Receipt Preview</span>
                </div>
              </div>
            </div>
          </div>
        </FormDialog>
      )}
    </div>
  );
};

export default PaymentManagement;
