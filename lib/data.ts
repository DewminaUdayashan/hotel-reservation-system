"use client";

// This file contains mock data for the hotel reservation system

import { Reservation } from "./types/reservation";
import { Room, RoomType } from "./types/room";

// Room Types
export const roomTypes: RoomType[] = [
  {
    id: 1,
    name: "Standard Room",
    description:
      "Comfortable room with all the essential amenities for a pleasant stay.",
    price: 120,
    capacity: 2,
    amenities: [
      "Free WiFi",
      "TV",
      "Air Conditioning",
      "Private Bathroom",
      "Coffee Maker",
    ],
    images: [
      "/images/room_types/standard-room.jpg",
      "/images/room_types/standard-room-2.webp",
    ],
    bedType: "Queen",
    view: "City",
  },
  {
    id: 2,
    name: "Deluxe Room",
    description:
      "Spacious room with premium amenities and a beautiful city view.",
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
    images: ["/images/room_types/deluxe-room.jpg.avif"],
    bedType: "King",
    view: "City or Partial Sea",
  },
  {
    id: 3,
    name: "Executive Suite",
    description:
      "Elegant suite with separate living area and premium amenities.",
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
    images: ["/images/room_types/executive-suite.jpg"],
    bedType: "King + Sofa Bed",
    view: "Sea or Panoramic",
  },
  {
    id: 4,
    name: "Residential Suite",
    description:
      "Long-term stay suite with kitchen and all the comforts of home.",
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
    images: ["/images/room_types/residential-suite.jpg"],
    isResidential: true,
    bedType: "2 Queens with Sofa",
    view: "Panoramic, City or Sea",
  },
];

// Example dummy data for Room[]
export const rooms: Room[] = [
  {
    id: 1,
    name: "Standard Room 101",
    description: "A cozy standard room with a queen bed and city view.",
    images: [
      "/images/room_types/standard-room.jpg",
      "/images/room_types/standard-room-2.webp",
    ],
    status: "available",
    type: 1,
    bedType: "Queen",
    view: "City",
  },
  {
    id: 2,
    name: "Deluxe Room 201",
    description: "Spacious deluxe room with a king bed and balcony.",
    images: [
      "/images/room_types/standard-room.jpg",
      "/images/room_types/standard-room-2.webp",
    ],
    status: "available",
    type: 2,
    bedType: "King",
    view: "City",
  },
  {
    id: 5,
    name: "Deluxe Room 202",
    description: "Spacious deluxe room with a king bed and balcony.",
    images: [
      "/images/room_types/standard-room.jpg",
      "/images/room_types/standard-room-2.webp",
    ],
    status: "available",
    type: 2,
    bedType: "King",
    view: "City",
  },
  {
    id: 3,
    name: "Executive Suite 301",
    description: "Luxurious executive suite with living area and workspace.",
    images: [
      "/images/room_types/standard-room.jpg",
      "/images/room_types/standard-room-2.webp",
    ],
    status: "available",
    type: 3,
    bedType: "King + Sofa Bed",
    view: "Sea",
  },
  {
    id: 4,
    name: "Residential Suite 401",
    description: "Premium residential suite with kitchen and two bedrooms.",
    images: [
      "/images/room_types/standard-room.jpg",
      "/images/room_types/standard-room-2.webp",
    ],
    status: "maintenance",
    type: 4,
    bedType: "2 Queens",
    view: "Sea",
  },
  {
    id: 6,
    name: "Residential Suite 422",
    description: "Premium residential suite with kitchen and two bedrooms.",
    images: [
      "/images/room_types/standard-room.jpg",
      "/images/room_types/standard-room-2.webp",
    ],
    status: "available",
    type: 4,
    bedType: "2 Queens",
    view: "Panoramic",
  },
];

// Reservations
export const reservations: Reservation[] = [
  {
    id: 1,
    customerId: 1,
    roomId: 1,
    checkIn: new Date("2025-05-18"),
    checkOut: new Date("2025-05-19"),
    guests: 2,
    status: "checked-in",
    paymentStatus: "pending",
    paymentMethod: "credit-card",
    totalAmount: 540,
    additionalCharges: [],
    specialRequests: "Late check-in, room with a view if possible.",
    createdAt: new Date("2025-05-10"),
  },
];

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
];

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
];

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
];
