import { create } from "zustand";
import { persist } from "zustand/middleware";
import { RoomType } from "./types/room";

// Define types
export type RoomFilter = {
  checkIn: Date | undefined;
  checkOut: Date | undefined;
  roomType: RoomType | undefined;
  capacity: number | undefined;
  maxPrice: number | undefined;
  minPrice: number | undefined;
};

export type User = {
  id: string;
  name: string;
  email: string;
  isLoggedIn: boolean;
};

export type Reservation = {
  id: string;
  customerId: string;
  roomId: number;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  status: "reserved" | "checked-in" | "checked-out" | "cancelled" | "no-show";
  paymentStatus: "pending" | "paid" | "partial" | "refunded";
  paymentMethod: string;
  totalAmount: number;
  additionalCharges: Array<{
    id: number;
    description: string;
    amount: number;
    date: Date;
  }>;
  specialRequests: string;
  createdAt: Date;
  customerName?: string;
  roomType?: string;
  roomNumber?: string;
};

// Define store type
type StoreState = {
  // Room filters
  filters: RoomFilter;
  setFilters: (filters: Partial<RoomFilter>) => void;
  clearFilters: () => void;
};

// Create store
export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // Room filters
      filters: {
        checkIn: undefined,
        checkOut: undefined,
        roomType: undefined,
        capacity: undefined,
        maxPrice: undefined,
        minPrice: undefined,
      },

      setFilters: (filters: Partial<RoomFilter>) =>
        set((state) => ({
          filters: { ...state.filters, ...filters },
        })),

      clearFilters: () =>
        set({
          filters: {
            checkIn: undefined,
            checkOut: undefined,
            roomType: undefined,
            capacity: undefined,
            maxPrice: undefined,
            minPrice: undefined,
          },
        }),
    }),
    {
      name: "hotel-storage",
    }
  )
);
