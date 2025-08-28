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
import { Line, Pie } from "react-chartjs-2";
import StatCard from "./StatCard";
import DataGrid from "../../ui/DataGrid";
import { travels, stats } from "../../utils/dummyData";
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

const ManagerDashboard = () => {
  const travelStatusData = [
    {
      status: "PLANNED",
      count: travels.filter((t) => t.status === "PLANNED").length,
    },
    {
      status: "ONGOING",
      count: travels.filter((t) => t.status === "ONGOING").length,
    },
    {
      status: "COMPLETED",
      count: travels.filter((t) => t.status === "COMPLETED").length,
    },
    {
      status: "CANCELLED",
      count: travels.filter((t) => t.status === "CANCELLED").length,
    },
  ];

  const revenueData = [
    { month: "Jan", revenue: 12000 },
    { month: "Feb", revenue: 19000 },
    { month: "Mar", revenue: 15000 },
    { month: "Apr", revenue: 18000 },
    { month: "May", revenue: 21000 },
    { month: "Jun", revenue: 25000 },
  ];

  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Monthly Revenue (Last 6 Months)",
      },
    },
  };

  const lineChartData = {
    labels: revenueData.map((data) => data.month),
    datasets: [
      {
        label: "Revenue",
        data: revenueData.map((data) => data.revenue),
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.5)",
        tension: 0.3,
      },
    ],
  };

  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Travel Status Distribution",
      },
    },
  };

  const pieChartData = {
    labels: travelStatusData.map((data) => data.status),
    datasets: [
      {
        label: "Travels",
        data: travelStatusData.map((data) => data.count),
        backgroundColor: [
          "rgba(59, 130, 246, 0.8)",
          "rgba(16, 185, 129, 0.8)",
          "rgba(156, 163, 175, 0.8)",
          "rgba(239, 68, 68, 0.8)",
        ],
        borderColor: [
          "rgb(59, 130, 246)",
          "rgb(16, 185, 129)",
          "rgb(156, 163, 175)",
          "rgb(239, 68, 68)",
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Travels"
          value={stats.totalTravels}
          icon="globe"
          change="+12% from last month"
        />
        <StatCard
          title="Total Bookings"
          value={stats.totalBookings}
          icon="ticket"
          change="+8% from last month"
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          icon="currency"
          change="+15% from last month"
        />
        <StatCard
          title="Pending Payments"
          value={stats.pendingPayments}
          icon="payment"
          change="-3% from last month"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <Line options={lineChartOptions} data={lineChartData} />
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <Pie options={pieChartOptions} data={pieChartData} />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Travels</h2>
        <DataGrid
          headers={["Title", "Dates", "Price", "Bookings", "Status"]}
          rows={travels.map((travel) => [
            travel.title,
            `${travel.startDate} to ${travel.endDate}`,
            formatCurrency(travel.price),
            travel.bookings,
            <span
              className={`px-2 py-1 rounded-full text-xs ${
                getStatusBadge(travel.status).color
              }`}
            >
              {getStatusBadge(travel.status).text}
            </span>,
          ])}
        />
      </div>
    </div>
  );
};

export default ManagerDashboard;
