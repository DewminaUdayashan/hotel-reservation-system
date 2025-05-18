// This file contains mock data for the hotel reservation system

// Room Types
export const roomTypes = [
  {
    id: "standard",
    name: "Standard Room",
    description: "Comfortable room with all the essential amenities for a pleasant stay.",
    price: 120,
    capacity: 2,
    amenities: ["Free WiFi", "TV", "Air Conditioning", "Private Bathroom", "Coffee Maker"],
    images: ["/placeholder.svg?height=400&width=600"],
  },
  {
    id: "deluxe",
    name: "Deluxe Room",
    description: "Spacious room with premium amenities and a beautiful city view.",
    price: 180,
    capacity: 2,
    amenities: [
      "Free WiFi",
      "Smart TV",
      "Air Conditioning",
      "Luxury Bathroom",
      "Mini Bar",
      "Coffee Maker",
      "Work Desk",
    ],
    images: ["/placeholder.svg?height=400&width=600"],
  },
  {
    id: "executive",
    name: "Executive Suite",
    description: "Elegant suite with separate living area and premium amenities.",
    price: 250,
    capacity: 3,
    amenities: [
      "Free WiFi",
      "Smart TV",
      "Air Conditioning",
      "Jacuzzi",
      "Mini Bar",
      "Coffee Maker",
      "Lounge Area",
      "Work Desk",
    ],
    images: ["/placeholder.svg?height=400&width=600"],
  },
  {
    id: "residential",
    name: "Residential Suite",
    description: "Long-term stay suite with kitchen and all the comforts of home.",
    price: 350,
    weeklyRate: 2100,
    monthlyRate: 7500,
    capacity: 4,
    amenities: [
      "Free WiFi",
      "Smart TV",
      "Air Conditioning",
      "Full Kitchen",
      "Washer/Dryer",
      "Living Room",
      "Dining Area",
      "Work Desk",
    ],
    images: ["/placeholder.svg?height=400&width=600"],
    isResidential: true,
  },
]

// Rooms
export const rooms = [
  { id: 101, type: "standard", status: "available", floor: 1 },
  { id: 102, type: "standard", status: "occupied", floor: 1 },
  { id: 103, type: "standard", status: "reserved", floor: 1 },
  { id: 104, type: "standard", status: "maintenance", floor: 1 },
  { id: 201, type: "deluxe", status: "available", floor: 2 },
  { id: 202, type: "deluxe", status: "occupied", floor: 2 },
  { id: 203, type: "deluxe", status: "available", floor: 2 },
  { id: 301, type: "executive", status: "available", floor: 3 },
  { id: 302, type: "executive", status: "occupied", floor: 3 },
  { id: 401, type: "residential", status: "available", floor: 4 },
  { id: 402, type: "residential", status: "occupied", floor: 4 },
]

// Customers
export const customers = [
  {
    id: "C1001",
    firstName: "John",
    lastName: "Smith",
    email: "john.smith@example.com",
    phone: "+1 (555) 123-4567",
    address: "123 Main St, Anytown, CA 12345",
    creditCard: {
      last4: "1234",
      expiryDate: "05/25",
      cardholderName: "John Smith",
    },
    stayHistory: 3,
  },
  {
    id: "C1002",
    firstName: "Emily",
    lastName: "Johnson",
    email: "emily.johnson@example.com",
    phone: "+1 (555) 987-6543",
    address: "456 Oak Ave, Somewhere, NY 67890",
    creditCard: {
      last4: "5678",
      expiryDate: "09/24",
      cardholderName: "Emily Johnson",
    },
    stayHistory: 1,
  },
  {
    id: "C1003",
    firstName: "Michael",
    lastName: "Brown",
    email: "michael.brown@example.com",
    phone: "+1 (555) 456-7890",
    address: "789 Pine St, Elsewhere, TX 54321",
    creditCard: null,
    stayHistory: 0,
  },
]

// Reservations
export const reservations = [
  {
    id: "RES1001",
    customerId: "C1001",
    roomId: 102,
    checkIn: new Date("2023-06-15"),
    checkOut: new Date("2023-06-18"),
    guests: 2,
    status: "checked-in",
    paymentStatus: "pending",
    paymentMethod: "credit-card",
    totalAmount: 540,
    additionalCharges: [
      { id: 1, description: "Room Service", amount: 45, date: new Date("2023-06-16") },
      { id: 2, description: "Restaurant", amount: 78, date: new Date("2023-06-17") },
    ],
    specialRequests: "Late check-in, room with a view if possible.",
    createdAt: new Date("2023-05-20"),
  },
  {
    id: "RES1002",
    customerId: "C1002",
    roomId: 203,
    checkIn: new Date("2023-06-16"),
    checkOut: new Date("2023-06-20"),
    guests: 2,
    status: "reserved",
    paymentStatus: "paid",
    paymentMethod: "credit-card",
    totalAmount: 720,
    additionalCharges: [],
    specialRequests: "",
    createdAt: new Date("2023-06-01"),
  },
  {
    id: "RES1003",
    customerId: "C1003",
    roomId: 302,
    checkIn: new Date("2023-06-14"),
    checkOut: new Date("2023-06-17"),
    guests: 3,
    status: "checked-out",
    paymentStatus: "paid",
    paymentMethod: "cash",
    totalAmount: 750,
    additionalCharges: [{ id: 3, description: "Laundry", amount: 35, date: new Date("2023-06-15") }],
    specialRequests: "Extra pillows",
    createdAt: new Date("2023-06-10"),
  },
  {
    id: "RES1004",
    customerId: "C1001",
    roomId: 402,
    checkIn: new Date("2023-06-10"),
    checkOut: new Date("2023-06-24"),
    guests: 4,
    status: "checked-in",
    paymentStatus: "partial",
    paymentMethod: "credit-card",
    totalAmount: 4900,
    additionalCharges: [
      { id: 4, description: "Room Service", amount: 120, date: new Date("2023-06-12") },
      { id: 5, description: "Restaurant", amount: 230, date: new Date("2023-06-14") },
    ],
    specialRequests: "Weekly cleaning service",
    createdAt: new Date("2023-05-15"),
  },
]

// Travel Companies
export const travelCompanies = [
  {
    id: "TC001",
    name: "Global Travels",
    contactPerson: "Sarah Wilson",
    email: "sarah@globaltravels.com",
    phone: "+1 (555) 111-2222",
    discountRate: 15, // percentage
    blockBookings: [
      {
        id: "BB001",
        startDate: new Date("2023-07-10"),
        endDate: new Date("2023-07-15"),
        roomCount: 5,
        roomType: "deluxe",
        status: "confirmed",
        totalAmount: 3825, // 5 rooms * 5 nights * $180 * 0.85 (15% discount)
      },
    ],
  },
  {
    id: "TC002",
    name: "Business Trips Inc.",
    contactPerson: "David Lee",
    email: "david@businesstrips.com",
    phone: "+1 (555) 333-4444",
    discountRate: 20, // percentage
    blockBookings: [
      {
        id: "BB002",
        startDate: new Date("2023-08-05"),
        endDate: new Date("2023-08-08"),
        roomCount: 10,
        roomType: "standard",
        status: "pending",
        totalAmount: 2880, // 10 rooms * 3 nights * $120 * 0.8 (20% discount)
      },
    ],
  },
]

// Reports
export const reports = [
  {
    id: "REP001",
    name: "Daily Occupancy",
    type: "occupancy",
    frequency: "daily",
    lastGenerated: new Date("2023-06-15T19:00:00"),
    recipients: ["manager@luxestay.com", "frontdesk@luxestay.com"],
    data: {
      date: "2023-06-15",
      totalRooms: 48,
      occupiedRooms: 36,
      occupancyRate: 75,
      revenue: 6480,
    },
  },
  {
    id: "REP002",
    name: "Weekly Revenue",
    type: "revenue",
    frequency: "weekly",
    lastGenerated: new Date("2023-06-12T08:00:00"),
    recipients: ["manager@luxestay.com", "finance@luxestay.com"],
    data: {
      startDate: "2023-06-05",
      endDate: "2023-06-11",
      totalRevenue: 42500,
      roomRevenue: 38200,
      additionalCharges: 4300,
      comparisonToPreviousWeek: "+5.2%",
    },
  },
  {
    id: "REP003",
    name: "No-Show Report",
    type: "no-show",
    frequency: "daily",
    lastGenerated: new Date("2023-06-15T19:30:00"),
    recipients: ["manager@luxestay.com", "billing@luxestay.com"],
    data: {
      date: "2023-06-15",
      totalReservations: 42,
      noShows: 3,
      noShowRate: 7.14,
      billedAmount: 720,
    },
  },
]
