import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Pie } from "react-chartjs-2";
import StatCard from "./StatCard";
import DataGrid from "../../ui/DataGrid";
import { bookings, payments } from "../../utils/dummyData";
import { formatCurrency, getStatusBadge } from "../../utils/helpers";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const SupervisorDashboard = () => {
  const bookingStatusData = [
    {
      status: "PENDING",
      count: bookings.filter((b) => b.status === "PENDING").length,
    },
    {
      status: "APPROVED",
      count: bookings.filter((b) => b.status === "APPROVED").length,
    },
    {
      status: "REJECTED",
      count: bookings.filter((b) => b.status === "REJECTED").length,
    },
  ];

  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Booking Status",
      },
    },
  };

  const pieChartData = {
    labels: bookingStatusData.map((data) => data.status),
    datasets: [
      {
        label: "Bookings",
        data: bookingStatusData.map((data) => data.count),
        backgroundColor: [
          "rgba(245, 158, 11, 0.8)",
          "rgba(16, 185, 129, 0.8)",
          "rgba(239, 68, 68, 0.8)",
        ],
        borderColor: [
          "rgb(245, 158, 11)",
          "rgb(16, 185, 129)",
          "rgb(239, 68, 68)",
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Pending Approvals"
          value={3}
          icon="approval"
          change="+1 from yesterday"
        />
        <StatCard
          title="Upcoming Check-ins"
          value={15}
          icon="checkin"
          change="+3 from yesterday"
        />
        <StatCard
          title="Travelers Today"
          value={8}
          icon="users"
          change="+2 from yesterday"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <Pie options={pieChartOptions} data={pieChartData} />
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Pending Payments</h2>
          <DataGrid
            headers={["Booking ID", "Traveler", "Amount", "Status"]}
            rows={payments
              .filter((p) => p.status === "PENDING")
              .map((payment) => [
                `#${payment.bookingId}`,
                bookings.find((b) => b.id === payment.bookingId)?.traveler,
                formatCurrency(payment.amount),
                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                  Pending
                </span>,
              ])}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Bookings</h2>
        <DataGrid
          headers={["ID", "Traveler", "Tickets", "Status"]}
          rows={bookings.map((booking) => [
            `#${booking.id}`,
            booking.traveler,
            booking.tickets,
            <span
              className={`px-2 py-1 rounded-full text-xs ${
                getStatusBadge(booking.status).color
              }`}
            >
              {getStatusBadge(booking.status).text}
            </span>,
          ])}
        />
      </div>
    </div>
  );
};

export default SupervisorDashboard;
