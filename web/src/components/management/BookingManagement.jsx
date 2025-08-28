import React, { useState } from "react";
import DataGrid from "../../ui/DataGrid";
import FormDialog from "../../ui/FormDialog";
import { bookings, travels, bookingStatusOptions } from "../../utils/dummyData";

const BookingManagement = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentBooking, setCurrentBooking] = useState(null);
  const [filter, setFilter] = useState("all");

  const handleView = (booking) => {
    setCurrentBooking(booking);
    setIsDialogOpen(true);
  };

  const handleStatusChange = (booking, status) => {
    console.log(`Change booking #${booking.id} status to ${status}`);
    alert(`Booking status changed to ${status}`);
  };

  const filteredBookings =
    filter === "all" ? bookings : bookings.filter((b) => b.status === filter);

  const bookingActions = [
    {
      label: "Approve",
      onClick: (b) => handleStatusChange(b, "APPROVED"),
      className: "text-green-600 hover:text-green-900",
      show: (b) => b.status === "PENDING",
    },
    {
      label: "Reject",
      onClick: (b) => handleStatusChange(b, "REJECTED"),
      className: "text-red-600 hover:text-red-900",
      show: (b) => b.status === "PENDING",
    },
    {
      label: "View",
      onClick: handleView,
      show: (b) => b.status !== "PENDING",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Booking Management</h2>
        <div className="flex space-x-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1"
          >
            <option value="all">All Statuses</option>
            {bookingStatusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <DataGrid
        headers={["ID", "Travel", "Traveler", "Tickets", "Status"]}
        rows={filteredBookings.map((booking) => [
          `#${booking.id}`,
          travels.find((t) => t.id === booking.travelId)?.title,
          booking.traveler,
          booking.tickets,
          <span
            className={`px-2 py-1 rounded-full text-xs ${
              booking.status === "PENDING"
                ? "bg-yellow-100 text-yellow-800"
                : booking.status === "APPROVED"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {
              bookingStatusOptions.find((o) => o.value === booking.status)
                ?.label
            }
          </span>,
        ])}
        actions={bookingActions.filter(
          (action) => !action.show || action.show(bookings)
        )}
      />

      {currentBooking && (
        <FormDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          title={`Booking Details #${currentBooking.id}`}
          size="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Travel</h3>
                <p className="text-lg">
                  {travels.find((t) => t.id === currentBooking.travelId)?.title}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Traveler</h3>
                <p className="text-lg">{currentBooking.traveler}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Status</h3>
                <p className="text-lg">
                  <span
                    className={`px-2 py-1 rounded-full text-sm ${
                      currentBooking.status === "PENDING"
                        ? "bg-yellow-100 text-yellow-800"
                        : currentBooking.status === "APPROVED"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {
                      bookingStatusOptions.find(
                        (o) => o.value === currentBooking.status
                      )?.label
                    }
                  </span>
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Tickets</h3>
                <p className="text-lg">{currentBooking.tickets}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Travel Dates
              </h3>
              <p className="text-lg">
                {
                  travels.find((t) => t.id === currentBooking.travelId)
                    ?.startDate
                }{" "}
                to{" "}
                {travels.find((t) => t.id === currentBooking.travelId)?.endDate}
              </p>
            </div>

            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-500">
                Ticket Holders
              </h3>
              <div className="mt-2 space-y-2">
                {[...Array(currentBooking.tickets)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
                    <div>
                      <p className="font-medium">Ticket Holder {i + 1}</p>
                      <p className="text-sm text-gray-500">
                        Badge: BN-{currentBooking.id}-{i + 1}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </FormDialog>
      )}
    </div>
  );
};

export default BookingManagement;
