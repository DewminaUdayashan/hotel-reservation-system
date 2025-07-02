"use client";

import { useAxios } from "@/lib/axios";
import {
  BlockBooking,
  BlockBookingWithDetails,
  BLOCK_BOOKING_DISCOUNT,
  CreateBlockBookingInput,
} from "@/lib/types/block-booking";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Utility function to simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock data for development
const mockBlockBookings: BlockBooking[] = [
  {
    id: 1,
    agencyId: 1,
    totalRooms: 5,
    checkInDate: new Date("2024-02-15"),
    checkOutDate: new Date("2024-02-18"),
    totalAmount: 2550, // After 15% discount
    discountPercentage: 15,
    discountAmount: 450,
    specialRequests: "Conference group - need adjoining rooms",
    status: "confirmed",
    createdAt: new Date("2024-01-15"),
  },
];

// Get all block bookings for an agency
export const useAgencyBlockBookings = (agencyId?: number) => {
  return useQuery({
    queryKey: ["blockBookings", "agency", agencyId],
    queryFn: async (): Promise<BlockBooking[]> => {
      await delay(500);
      if (!agencyId) return [];
      return mockBlockBookings.filter((bb) => bb.agencyId === agencyId);
    },
    enabled: !!agencyId,
  });
};

// Get block booking details with reservations
export const useBlockBookingDetails = (blockBookingId: number) => {
  return useQuery({
    queryKey: ["blockBooking", blockBookingId],
    queryFn: async (): Promise<BlockBookingWithDetails> => {
      await delay(500);
      const blockBooking = mockBlockBookings.find(
        (bb) => bb.id === blockBookingId
      );
      if (!blockBooking) throw new Error("Block booking not found");

      // In real implementation, fetch associated reservations
      return {
        ...blockBooking,
        agencyName: "Travel Pro Agency",
        reservations: [], // Would be populated with actual reservations
      };
    },
    enabled: !!blockBookingId,
  });
};

// Calculate block booking pricing
export const useBlockBookingPricing = () => {
  return {
    calculateDiscount: (totalRooms: number, originalAmount: number) => {
      if (totalRooms >= BLOCK_BOOKING_DISCOUNT.minimumRooms) {
        const discountAmount =
          originalAmount * (BLOCK_BOOKING_DISCOUNT.percentage / 100);
        return {
          isEligible: true,
          discountPercentage: BLOCK_BOOKING_DISCOUNT.percentage,
          discountAmount,
          finalAmount: originalAmount - discountAmount,
          savings: discountAmount,
        };
      }
      return {
        isEligible: false,
        discountPercentage: 0,
        discountAmount: 0,
        finalAmount: originalAmount,
        savings: 0,
      };
    },
    minimumRooms: BLOCK_BOOKING_DISCOUNT.minimumRooms,
    discountPercentage: BLOCK_BOOKING_DISCOUNT.percentage,
  };
};

// Cancel block booking
export const useCancelBlockBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (blockBookingId: number): Promise<void> => {
      await delay(1000);

      // In real implementation, this would:
      // 1. Check if cancellation is allowed (7 days before check-in)
      // 2. Cancel the block booking
      // 3. Cancel all associated reservations

      console.log("Cancelling block booking:", blockBookingId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blockBookings"] });
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
    },
  });
};

// Check if block booking can be cancelled
export const useCanCancelBlockBooking = (checkInDate: Date) => {
  const canCancel = () => {
    const now = new Date();
    const checkIn = new Date(checkInDate);
    const daysDifference = Math.ceil(
      (checkIn.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysDifference >= 7;
  };

  return {
    canCancel: canCancel(),
    daysUntilCheckIn: Math.ceil(
      (new Date(checkInDate).getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24)
    ),
    minimumCancellationDays: 7,
  };
};

export const useCreateBlockBooking = () => {
  const axios = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateBlockBookingInput): Promise<number> => {
      const res = await axios.post("/reservations/block-booking", data);
      return res.data.blockBookingId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(); // You can narrow this down later if needed
    },
  });
};
