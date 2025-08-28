export function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export const formatDate = (dateString) => {
  const options = { year: "numeric", month: "short", day: "numeric" };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const getStatusBadge = (status) => {
  const statusConfig = {
    PLANNED: { text: "Planned", color: "bg-blue-100 text-blue-800" },
    ONGOING: { text: "Ongoing", color: "bg-green-100 text-green-800" },
    COMPLETED: { text: "Completed", color: "bg-gray-100 text-gray-800" },
    CANCELLED: { text: "Cancelled", color: "bg-red-100 text-red-800" },
    PENDING: { text: "Pending", color: "bg-yellow-100 text-yellow-800" },
    APPROVED: { text: "Approved", color: "bg-green-100 text-green-800" },
    REJECTED: { text: "Rejected", color: "bg-red-100 text-red-800" },
  };

  return (
    statusConfig[status] || { text: status, color: "bg-gray-100 text-gray-800" }
  );
};
