// Dummy data for the application
export const users = [
  { id: 1, name: "John Traveler", phone: "+1234567890", role: "TRAVELER" },
  { id: 2, name: "Sarah Manager", phone: "+1987654321", role: "MANAGER" },
  { id: 3, name: "Mike Supervisor", phone: "+1122334455", role: "SUPERVISOR" },
];

export const travels = [
  {
    id: 1,
    title: "Bali Adventure",
    description: "Explore the beautiful beaches and culture of Bali",
    startDate: "2023-11-15",
    endDate: "2023-11-22",
    price: 1200,
    status: "PLANNED",
    bookings: 24,
  },
  {
    id: 2,
    title: "Japan Cultural Tour",
    description: "Discover ancient temples and modern cities",
    startDate: "2023-12-01",
    endDate: "2023-12-10",
    price: 1800,
    status: "ONGOING",
    bookings: 18,
  },
  {
    id: 3,
    title: "Swiss Alps Expedition",
    description: "Mountain adventures in the Swiss Alps",
    startDate: "2024-01-10",
    endDate: "2024-01-20",
    price: 2200,
    status: "PLANNED",
    bookings: 12,
  },
];

export const bookings = [
  {
    id: 1,
    travelId: 1,
    traveler: "John Traveler",
    status: "APPROVED",
    tickets: 2,
  },
  {
    id: 2,
    travelId: 1,
    traveler: "Alice Smith",
    status: "PENDING",
    tickets: 1,
  },
  {
    id: 3,
    travelId: 2,
    traveler: "Bob Johnson",
    status: "APPROVED",
    tickets: 3,
  },
];

export const payments = [
  { id: 1, bookingId: 1, amount: 2400, status: "APPROVED" },
  { id: 2, bookingId: 2, amount: 1200, status: "PENDING" },
  { id: 3, bookingId: 3, amount: 5400, status: "APPROVED" },
];

export const stats = {
  totalTravels: 12,
  totalBookings: 54,
  totalRevenue: 64800,
  pendingPayments: 3,
};

// Add missing exports
export const coupons = [
  {
    id: 1,
    code: "SUMMER20",
    discount: 20,
    validFrom: "2023-06-01",
    validTo: "2023-08-31",
    used: 12,
  },
  {
    id: 2,
    code: "WELCOME10",
    discount: 10,
    validFrom: "2023-01-01",
    validTo: "2023-12-31",
    used: 24,
  },
  {
    id: 3,
    code: "VIP25",
    discount: 25,
    validFrom: "2023-05-15",
    validTo: "2023-06-15",
    used: 8,
  },
];

export const activityLog = [
  {
    id: 1,
    user: "Sarah Manager",
    action: "Created new travel: Swiss Alps Expedition",
    timestamp: "2023-05-10 14:30",
  },
  {
    id: 2,
    user: "Mike Supervisor",
    action: "Approved payment for booking #342",
    timestamp: "2023-05-10 11:15",
  },
  {
    id: 3,
    user: "John Traveler",
    action: "Booked Bali Adventure for 2 tickets",
    timestamp: "2023-05-09 16:45",
  },
  {
    id: 4,
    user: "Sarah Manager",
    action: "Updated coupon VIP25",
    timestamp: "2023-05-08 09:20",
  },
  {
    id: 5,
    user: "Mike Supervisor",
    action: "Checked in traveler for Japan Tour",
    timestamp: "2023-05-07 10:30",
  },
];

export const travelStatusOptions = [
  { value: "PLANNED", label: "Planned" },
  { value: "ONGOING", label: "Ongoing" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

export const bookingStatusOptions = [
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
];

export const paymentStatusOptions = [
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
];
// ... existing exports ...

// Add documents export
export const documents = [
  {
    id: 1,
    travelId: 1,
    title: "Travel Itinerary.pdf",
    fileUrl: "/documents/itinerary.pdf",
    type: "PDF",
    createdAt: "2023-10-15",
  },
  {
    id: 2,
    travelId: 1,
    title: "Hotel Information.docx",
    fileUrl: "/documents/hotel-info.docx",
    type: "DOCX",
    createdAt: "2023-10-10",
  },
  {
    id: 3,
    travelId: 2,
    title: "Flight Schedule.pdf",
    fileUrl: "/documents/flights.pdf",
    type: "PDF",
    createdAt: "2023-11-20",
  },
  {
    id: 4,
    travelId: 3,
    title: "Equipment Checklist.xlsx",
    fileUrl: "/documents/checklist.xlsx",
    type: "XLSX",
    createdAt: "2023-12-05",
  },
];

// Add comments export
export const comments = [
  {
    id: 1,
    travelId: 1,
    userId: "1",
    userName: "John Traveler",
    content: "What time does the tour start on the first day?",
    type: "PRE_TRAVEL",
    createdAt: "2023-10-15T14:30:00Z",
  },
  {
    id: 2,
    travelId: 1,
    userId: "admin",
    userName: "Travel Support",
    content: "The tour starts at 9:00 AM at the hotel lobby.",
    type: "PRE_TRAVEL",
    createdAt: "2023-10-15T16:45:00Z",
  },
  {
    id: 3,
    travelId: 2,
    userId: "2",
    userName: "Alice Smith",
    content: "Is vegetarian meal option available?",
    type: "PRE_TRAVEL",
    createdAt: "2023-11-05T09:15:00Z",
  },
  {
    id: 4,
    travelId: 3,
    userId: "3",
    userName: "Bob Johnson",
    content:
      "The mountain trek was amazing! The guides were very knowledgeable.",
    type: "POST_TRAVEL",
    createdAt: "2024-02-01T18:30:00Z",
  },
];
