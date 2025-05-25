import { create } from "zustand";
import { persist } from "zustand/middleware";
import { RoomType } from "../types/room";

// ---- Types ----

export type RoomFilter = {
  hotelId?: number;
  checkIn?: Date;
  checkOut?: Date;
  roomType?: RoomType;
  capacity?: number;
  minPrice?: number;
  maxPrice?: number;
};

interface RoomFilterStore {
  filters: RoomFilter;
  setFilters: (filters: Partial<RoomFilter>) => void;
  clearFilters: () => void;
}

// ---- Defaults ----

const defaultRoomFilters: RoomFilter = {
  hotelId: undefined,
  checkIn: undefined,
  checkOut: undefined,
  roomType: undefined,
  capacity: undefined,
  minPrice: undefined,
  maxPrice: undefined,
};

// ---- Store ----

export const useRoomFilterStore = create<RoomFilterStore>()(
  persist(
    (set, get) => ({
      filters: defaultRoomFilters,

      setFilters: (newFilters) =>
        set((state) => ({
          filters: {
            ...state.filters,
            ...newFilters,
          },
        })),

      clearFilters: () => set({ filters: defaultRoomFilters }),
    }),
    {
      name: "room-filter-storage",
      version: 1,
      // Rehydrate Date objects on load
      merge: (persistedState, currentState) => {
        const state = persistedState as RoomFilterStore;

        return {
          ...currentState,
          ...state,
          filters: {
            ...state.filters,
            checkIn: state.filters.checkIn
              ? new Date(state.filters.checkIn)
              : undefined,
            checkOut: state.filters.checkOut
              ? new Date(state.filters.checkOut)
              : undefined,
          },
        };
      },
    }
  )
);
