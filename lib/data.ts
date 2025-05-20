"use client";

// This file contains mock data for the hotel reservation system

import { Reservation } from "./types/reservation";
import { Room, RoomType } from "./types/room";

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
