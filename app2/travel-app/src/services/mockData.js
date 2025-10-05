export const travels = [
  {
    id: "1",
    title: "Bali Adventure",
    description: "Explore the beautiful beaches and culture of Bali",
    startDate: "2023-11-15",
    endDate: "2023-11-22",
    price: 1200,
    status: "PLANNED",
    itinerary: "Day 1: Arrival\nDay 2: Beach Tour\nDay 3: Cultural Experience",
    requirements: "Passport valid for 6 months\nTravel insurance",
    image: "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2",
  },
  {
    id: "2",
    title: "Japan Cultural Tour",
    description: "Discover ancient temples and modern cities",
    startDate: "2023-12-01",
    endDate: "2023-12-10",
    price: 1800,
    status: "ONGOING",
    itinerary:
      "Day 1: Tokyo arrival\nDay 2: Shrines visit\nDay 3: Bullet train to Kyoto",
    requirements: "Visa required\nVaccination certificate",
    image: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9",
  },
  {
    id: "3",
    title: "Swiss Alps Expedition",
    description: "Mountain adventures in the Swiss Alps",
    startDate: "2024-01-10",
    endDate: "2024-01-20",
    price: 2200,
    status: "PLANNED",
    itinerary:
      "Day 1: Zurich arrival\nDay 2: Train to Alps\nDay 3-5: Mountain trekking",
    requirements: "Warm clothing\nHiking boots",
    image: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99",
  },
];

export const bookings = [
  {
    id: "1",
    travelId: "1",
    status: "CONFIRMED",
    tickets: [
      {
        id: "1-1",
        name: "John Traveler",
        age: 35,
        badgeNumber: "BN-2023-001",
        qrCodeData: "TICKET:1-1",
      },
      {
        id: "1-2",
        name: "Jane Doe",
        age: 32,
        badgeNumber: "BN-2023-002",
        qrCodeData: "TICKET:1-2",
      },
    ],
    paymentStatus: "PAID",
  },
  {
    id: "2",
    travelId: "3",
    status: "PENDING",
    tickets: [
      {
        id: "2-1",
        name: "John Traveler",
        age: 35,
        badgeNumber: "BN-2024-101",
        qrCodeData: "TICKET:2-1",
      },
    ],
    paymentStatus: "PENDING",
  },
];

export const documents = [
  {
    id: "1",
    travelId: "1",
    title: "Travel Itinerary",
    fileUrl: "https://example.com/itinerary.pdf",
    type: "PDF",
  },
  {
    id: "2",
    travelId: "1",
    title: "Hotel Information",
    fileUrl: "https://example.com/hotel.pdf",
    type: "PDF",
  },
];

export const comments = [
  {
    id: "1",
    travelId: "1",
    userId: "1",
    userName: "John Traveler",
    content: "What time does the tour start on the first day?",
    type: "PRE_TRAVEL",
    createdAt: "2023-10-15T14:30:00Z",
  },
  {
    id: "2",
    travelId: "1",
    userId: "admin",
    userName: "Travel Support",
    content: "The tour starts at 9:00 AM at the hotel lobby.",
    type: "PRE_TRAVEL",
    createdAt: "2023-10-15T16:45:00Z",
  },
];
