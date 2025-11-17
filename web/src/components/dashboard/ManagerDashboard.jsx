import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Line, Pie, Bar } from "react-chartjs-2";
import StatCard from "./StatCard";
import PopularDestinations from "./PopularDestinations";
import DataGrid from "../../ui/DataGrid";
import { travels, stats } from "../../utils/dummyData";
import { formatCurrency, getStatusBadge } from "../../utils/helpers";

// Icons (you can replace with your actual icon components)
const UsersIcon = () => <span>👥</span>;
const TrendingUpIcon = () => <span>📈</span>;
const AlertIcon = () => <span>⚠️</span>;
const CalendarIcon = () => <span>📅</span>;

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
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
      color: "bg-blue-500",
    },
    {
      status: "ONGOING",
      count: travels.filter((t) => t.status === "ONGOING").length,
      color: "bg-green-500",
    },
    {
      status: "COMPLETED",
      count: travels.filter((t) => t.status === "COMPLETED").length,
      color: "bg-gray-500",
    },
    {
      status: "CANCELLED",
      count: travels.filter((t) => t.status === "CANCELLED").length,
      color: "bg-red-500",
    },
  ];

  const revenueData = [
    { month: "Jan", revenue: 12000, bookings: 45 },
    { month: "Feb", revenue: 19000, bookings: 62 },
    { month: "Mar", revenue: 15000, bookings: 58 },
    { month: "Apr", revenue: 18000, bookings: 61 },
    { month: "May", revenue: 21000, bookings: 75 },
    { month: "Jun", revenue: 25000, bookings: 82 },
  ];

  // Popular destinations now fetched by component itself (backend analytics)

  const upcomingTravels = travels
    .filter((t) => t.status === "PLANNED" || t.status === "ONGOING")
    .slice(0, 5);

  // Chart configurations
  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Revenue & Bookings Trend (Last 6 Months)",
        font: {
          size: 16,
          weight: "bold",
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  const lineChartData = {
    labels: revenueData.map((data) => data.month),
    datasets: [
      {
        label: "Revenue ($)",
        data: revenueData.map((data) => data.revenue),
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "Bookings",
        data: revenueData.map((data) => data.bookings),
        borderColor: "rgb(16, 185, 129)",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
      },
      title: {
        display: true,
        text: "Travel Status Distribution",
        font: {
          size: 16,
          weight: "bold",
        },
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
        borderWidth: 2,
      },
    ],
  };

  // Popular Destinations now modular via <PopularDestinations />

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back! Here's what's happening with your travels.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border">
          <CalendarIcon />
          <span className="text-sm font-medium text-gray-700">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Travels"
          value={stats.totalTravels}
          icon="globe"
          change="+12% from last month"
          trend="up"
          className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"
        />
        <StatCard
          title="Total Bookings"
          value={stats.totalBookings}
          icon="ticket"
          change="+8% from last month"
          trend="up"
          className="bg-gradient-to-br from-green-50 to-green-100 border-green-200"
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          icon="currency"
          change="+15% from last month"
          trend="up"
          className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200"
        />
        <StatCard
          title="Pending Payments"
          value={stats.pendingPayments}
          icon="payment"
          change="-3% from last month"
          trend="down"
          className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <Line options={lineChartOptions} data={lineChartData} />
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6 h-[330px]">
          <Pie options={pieChartOptions} data={pieChartData} />
        </div>
      </div>

      {/* Additional Content Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Popular Destinations */}
        <div className="lg:col-span-2">
          <PopularDestinations />
        </div>

        {/* Upcoming Travels & Quick Stats */}
        <div className="space-y-6">
          {/* Upcoming Travels */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Upcoming Travels
              </h2>
              <AlertIcon />
            </div>
            <div className="space-y-4">
              {upcomingTravels.map((travel) => (
                <div
                  key={travel.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:shadow-sm transition-shadow"
                >
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {travel.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {travel.startDate} • {travel.bookings} people
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      getStatusBadge(travel.status).color
                    }`}
                  >
                    {getStatusBadge(travel.status).text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Travel Status Overview */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Travel Status
            </h2>
            <div className="space-y-3">
              {travelStatusData.map((status) => (
                <div
                  key={status.status}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full ${status.color}`}
                    ></div>
                    <span className="text-gray-700">{status.status}</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {status.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Travels Table */}
      {/* <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Recent Travels
          </h2>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
            View All Travels
          </button>
        </div>
        <DataGrid
          headers={["Title", "Dates", "Price", "Bookings", "Status"]}
          rows={travels.slice(0, 8).map((travel) => [
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-lg">🌍</span>
              </div>
              <span className="font-medium text-gray-900">{travel.title}</span>
            </div>,
            <div className="text-sm">
              <div className="text-gray-900">{travel.startDate}</div>
              <div className="text-gray-500">to {travel.endDate}</div>
            </div>,
            <div className="font-semibold text-gray-900">
              {formatCurrency(travel.price)}
            </div>,
            <div className="flex items-center gap-2">
              <UsersIcon />
              <span className="font-medium">{travel.bookings}</span>
            </div>,
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                getStatusBadge(travel.status).color
              }`}
            >
              {getStatusBadge(travel.status).text}
            </span>,
          ])}
        />
      </div> */}
    </div>
  );
};

export default ManagerDashboard;
