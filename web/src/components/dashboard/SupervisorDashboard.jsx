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
import { Pie, Bar, Line } from "react-chartjs-2";
import StatCard from "./StatCard";
import DataGrid from "../../ui/DataGrid";
import { bookings, payments } from "../../utils/dummyData";
import { formatCurrency, getStatusBadge } from "../../utils/helpers";

// Icons (replace with your actual icon components)
const ClockIcon = () => <span className="text-yellow-500">⏰</span>;
const CheckCircleIcon = () => <span className="text-green-500">✅</span>;
const UserGroupIcon = () => <span className="text-blue-500">👥</span>;
const CalendarIcon = () => <span className="text-purple-500">📅</span>;
const AlertIcon = () => <span className="text-red-500">⚠️</span>;
const TrendingUpIcon = () => <span className="text-green-500">📈</span>;

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

const SupervisorDashboard = () => {
  const bookingStatusData = [
    {
      status: "PENDING",
      count: bookings.filter((b) => b.status === "PENDING").length,
      color: "bg-yellow-500",
    },
    {
      status: "APPROVED",
      count: bookings.filter((b) => b.status === "APPROVED").length,
      color: "bg-green-500",
    },
    {
      status: "REJECTED",
      count: bookings.filter((b) => b.status === "REJECTED").length,
      color: "bg-red-500",
    },
  ];

  const weeklyApprovals = [
    { day: "Mon", approvals: 12, rejections: 2 },
    { day: "Tue", approvals: 15, rejections: 1 },
    { day: "Wed", approvals: 8, rejections: 3 },
    { day: "Thu", approvals: 18, rejections: 2 },
    { day: "Fri", approvals: 14, rejections: 4 },
    { day: "Sat", approvals: 6, rejections: 1 },
    { day: "Sun", approvals: 4, rejections: 0 },
  ];

  const pendingPayments = payments.filter((p) => p.status === "PENDING");
  const totalPendingAmount = pendingPayments.reduce(
    (sum, payment) => sum + payment.amount,
    0
  );

  const urgentApprovals = bookings
    .filter((b) => b.status === "PENDING")
    .slice(0, 5);

  const recentActivities = [
    {
      action: "Booking Approved",
      user: "John Doe",
      time: "2 min ago",
      type: "success",
    },
    {
      action: "Payment Received",
      user: "Sarah Smith",
      time: "5 min ago",
      type: "success",
    },
    {
      action: "Booking Rejected",
      user: "Mike Johnson",
      time: "10 min ago",
      type: "error",
    },
    {
      action: "Check-in Completed",
      user: "Emily Brown",
      time: "15 min ago",
      type: "success",
    },
    {
      action: "Document Uploaded",
      user: "Alex Wilson",
      time: "20 min ago",
      type: "info",
    },
  ];

  // Chart configurations
  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
      },
      title: {
        display: true,
        text: "Booking Status Distribution",
        font: {
          size: 16,
          weight: "bold",
        },
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
        borderWidth: 2,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Weekly Approvals & Rejections",
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

  const barChartData = {
    labels: weeklyApprovals.map((data) => data.day),
    datasets: [
      {
        label: "Approvals",
        data: weeklyApprovals.map((data) => data.approvals),
        backgroundColor: "rgba(16, 185, 129, 0.8)",
        borderColor: "rgb(16, 185, 129)",
        borderWidth: 1,
        borderRadius: 4,
      },
      {
        label: "Rejections",
        data: weeklyApprovals.map((data) => data.rejections),
        backgroundColor: "rgba(239, 68, 68, 0.8)",
        borderColor: "rgb(239, 68, 68)",
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case "success":
        return <CheckCircleIcon />;
      case "error":
        return <AlertIcon />;
      case "info":
        return <ClockIcon />;
      default:
        return <ClockIcon />;
    }
  };

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Supervisor Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Manage bookings, approvals, and monitor team activities.
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
          title="Pending Approvals"
          value={
            bookingStatusData.find((b) => b.status === "PENDING")?.count || 0
          }
          icon="approval"
          change="+1 from yesterday"
          trend="up"
          className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200"
        />
        <StatCard
          title="Upcoming Check-ins"
          value={15}
          icon="checkin"
          change="+3 from yesterday"
          trend="up"
          className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"
        />
        <StatCard
          title="Travelers Today"
          value={8}
          icon="users"
          change="+2 from yesterday"
          trend="up"
          className="bg-gradient-to-br from-green-50 to-green-100 border-green-200"
        />
        <StatCard
          title="Pending Payments"
          value={formatCurrency(totalPendingAmount)}
          icon="payment"
          change={`${pendingPayments.length} payments pending`}
          trend="warning"
          className="bg-gradient-to-br from-red-50 to-red-100 border-red-200"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <Pie options={pieChartOptions} data={pieChartData} />
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <Bar options={barChartOptions} data={barChartData} />
        </div>
      </div>

      {/* Additional Content Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Urgent Approvals */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Urgent Approvals
            </h2>
            <AlertIcon />
          </div>
          <div className="space-y-4">
            {urgentApprovals.map((booking) => (
              <div
                key={booking.id}
                className="flex items-center justify-between p-3 border border-yellow-200 rounded-lg bg-yellow-50 hover:shadow-sm transition-shadow"
              >
                <div>
                  <h3 className="font-medium text-gray-900">
                    {booking.traveler}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {booking.tickets} tickets • #{booking.id}
                  </p>
                </div>
                <button className="px-3 py-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm font-medium">
                  Review
                </button>
              </div>
            ))}
            {urgentApprovals.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                No pending approvals
              </div>
            )}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Recent Activities
            </h2>
            <TrendingUpIcon />
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-shrink-0 mt-1">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.action}
                  </p>
                  <p className="text-sm text-gray-500">by {activity.user}</p>
                </div>
                <div className="flex-shrink-0">
                  <span className="text-xs text-gray-400">{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="space-y-6">
          {/* Booking Status Overview */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Booking Status
            </h2>
            <div className="space-y-3">
              {bookingStatusData.map((status) => (
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

          {/* Performance Metrics */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Today's Metrics
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Approval Rate</span>
                <span className="font-semibold text-green-600">92%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Avg. Response Time</span>
                <span className="font-semibold text-blue-600">15min</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Completed Tasks</span>
                <span className="font-semibold text-purple-600">24/30</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Payments */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Pending Payments
            </h2>
            <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
              {pendingPayments.length} pending
            </span>
          </div>
          <DataGrid
            headers={["Booking ID", "Traveler", "Amount", "Due Date", "Status"]}
            rows={pendingPayments
              .slice(0, 6)
              .map((payment) => [
                <div className="font-mono text-sm font-medium">
                  #{payment.bookingId}
                </div>,
                <div className="font-medium text-gray-900">
                  {bookings.find((b) => b.id === payment.bookingId)?.traveler}
                </div>,
                <div className="font-semibold text-red-600">
                  {formatCurrency(payment.amount)}
                </div>,
                <div className="text-sm text-gray-500">
                  {new Date(Date.now() + 86400000 * 3).toLocaleDateString()}
                </div>,
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                  Pending
                </span>,
              ])}
          />
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Recent Bookings
            </h2>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
              View All
            </button>
          </div>
          <DataGrid
            headers={["ID", "Traveler", "Tickets", "Date", "Status"]}
            rows={bookings.slice(0, 6).map((booking) => [
              <div className="font-mono text-sm font-medium">
                #{booking.id}
              </div>,
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <UserGroupIcon />
                </div>
                <span className="font-medium text-gray-900">
                  {booking.traveler}
                </span>
              </div>,
              <div className="text-center font-semibold text-gray-900">
                {booking.tickets}
              </div>,
              <div className="text-sm text-gray-500">
                {new Date().toLocaleDateString()}
              </div>,
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  getStatusBadge(booking.status).color
                }`}
              >
                {getStatusBadge(booking.status).text}
              </span>,
            ])}
          />
        </div>
      </div>
    </div>
  );
};

export default SupervisorDashboard;
