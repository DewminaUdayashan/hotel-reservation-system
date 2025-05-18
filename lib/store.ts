import { create } from "zustand";
import { persist } from "zustand/middleware";
import { roomTypes, rooms, reservations as mockReservations } from "./data";
import { RoomType } from "./types/room";

// Define types
export type RoomFilter = {
  checkIn: Date | undefined;
  checkOut: Date | undefined;
  roomType: RoomType | undefined;
  guests: string | undefined;
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

  // User authentication
  user: User;
  login: (userData: Omit<User, "isLoggedIn">) => void;
  logout: () => void;

  // Reservations
  reservations: Reservation[];
  addReservation: (
    reservation: Omit<Reservation, "id" | "createdAt">
  ) => string;
  updateReservation: (id: string, data: Partial<Reservation>) => void;
  cancelReservation: (id: string) => void;

  // Room availability
  checkRoomAvailability: (
    roomType: number,
    checkIn: Date,
    checkOut: Date
  ) => boolean;
  getAvailableRooms: (
    checkIn: Date,
    checkOut: Date,
    roomType?: number
  ) => any[];

  // Initialize with mock data
  initializeStore: () => void;
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
        guests: undefined,
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
            guests: undefined,
          },
        }),

      // User authentication
      user: {
        id: "",
        name: "",
        email: "",
        isLoggedIn: false,
      },

      login: (userData: Omit<User, "isLoggedIn">) =>
        set({
          user: { ...userData, isLoggedIn: true },
        }),

      logout: () =>
        set({
          user: {
            id: "",
            name: "",
            email: "",
            isLoggedIn: false,
          },
        }),

      // Reservations
      reservations: [],

      addReservation: (reservation: Omit<Reservation, "id" | "createdAt">) => {
        const id = `RES${Math.floor(1000 + Math.random() * 9000)}`;
        const newReservation = {
          ...reservation,
          id,
          createdAt: new Date(),
        };
        set((state) => ({
          reservations: [...state.reservations, newReservation],
        }));
        return id;
      },

      updateReservation: (id: string, data: Partial<Reservation>) =>
        set((state) => ({
          reservations: state.reservations.map((res) =>
            res.id === id ? { ...res, ...data } : res
          ),
        })),

      cancelReservation: (id: string) =>
        set((state) => ({
          reservations: state.reservations.map((res) =>
            res.id === id ? { ...res, status: "cancelled" } : res
          ),
        })),

      // Room availability
      checkRoomAvailability: (
        roomType: number,
        checkIn: Date,
        checkOut: Date
      ) => {
        const { reservations } = get();

        // Get all rooms of the specified type
        const roomsOfType = rooms.filter((room) => room.type === roomType);

        // Check if any of these rooms are available for the date range
        for (const room of roomsOfType) {
          // Skip rooms that are in maintenance
          if (room.status === "maintenance") continue;

          // Check if there are any overlapping reservations
          const hasOverlap = reservations.some((res) => {
            // Skip cancelled reservations
            if (res.status === "cancelled") return false;

            // Skip reservations for other rooms
            if (res.roomId !== room.id) return false;

            // Check for date overlap
            const resCheckIn = new Date(res.checkIn);
            const resCheckOut = new Date(res.checkOut);

            return (
              (checkIn >= resCheckIn && checkIn < resCheckOut) || // Check-in date falls within existing reservation
              (checkOut > resCheckIn && checkOut <= resCheckOut) || // Check-out date falls within existing reservation
              (checkIn <= resCheckIn && checkOut >= resCheckOut) // New reservation completely encompasses existing reservation
            );
          });

          // If no overlap, this room is available
          if (!hasOverlap) return true;
        }

        // No available rooms found
        return false;
      },

      getAvailableRooms: (checkIn: Date, checkOut: Date, roomType?: number) => {
        const { reservations } = get();

        // Filter rooms by type if specified
        let availableRooms = roomType
          ? rooms.filter((room) => room.type === roomType)
          : [...rooms];

        // Filter out rooms in maintenance
        availableRooms = availableRooms.filter(
          (room) => room.status !== "maintenance"
        );

        // Filter out rooms with overlapping reservations
        return availableRooms
          .filter((room) => {
            // Check if there are any overlapping reservations
            const hasOverlap = reservations.some((res) => {
              // Skip cancelled reservations
              if (res.status === "cancelled") return false;

              // Skip reservations for other rooms
              if (res.roomId !== room.id) return false;

              // Check for date overlap
              const resCheckIn = new Date(res.checkIn);
              const resCheckOut = new Date(res.checkOut);

              return (
                (checkIn >= resCheckIn && checkIn < resCheckOut) || // Check-in date falls within existing reservation
                (checkOut > resCheckIn && checkOut <= resCheckOut) || // Check-out date falls within existing reservation
                (checkIn <= resCheckIn && checkOut >= resCheckOut) // New reservation completely encompasses existing reservation
              );
            });

            // If no overlap, this room is available
            return !hasOverlap;
          })
          .map((room) => {
            const roomTypeDetails = roomTypes.find((rt) => rt.id === room.type);
            return { ...room, ...roomTypeDetails };
          });
      },

      // Initialize with mock data
      initializeStore: () => {
        const { reservations } = get();
        if (reservations.length === 0) {
          // Convert dates in mock data
          const formattedReservations = mockReservations.map((res) => ({
            ...res,
            status: res.status,
            checkIn: new Date(res.checkIn),
            checkOut: new Date(res.checkOut),
            createdAt: new Date(res.createdAt),
            additionalCharges: res.additionalCharges.map((charge) => ({
              ...charge,
              date: new Date(charge.date),
            })),
            // Add derived fields for display
            customerName: `John Doe`, // In a real app, this would come from the customer data
            roomType: rooms.find((r) => r.id === res.roomId)?.type || "Unknown",
            roomNumber: res.roomId.toString(),
          }));

          // set({ reservations: formattedReservations });
        }
      },
    }),
    {
      name: "hotel-storage",
      partialize: (state) => ({
        user: state.user,
        reservations: state.reservations,
        // Don't persist filters to localStorage
      }),
    }
  )
);

// Helper function to filter rooms based on criteria
export const filterRooms = (filters: RoomFilter) => {
  let filteredRooms = [...rooms];

  // Filter by room type
  if (filters.roomType) {
    filteredRooms = filteredRooms.filter(
      (room) => room.type === filters.roomType?.id
    );
  }

  // In a real app, we would check availability based on reservations
  // For now, just filter out rooms that are not available
  filteredRooms = filteredRooms.filter((room) => room.status !== "maintenance");

  // Get room details
  return filteredRooms.map((room) => {
    const roomTypeDetails = roomTypes.find((rt) => rt.id === room.type);
    return {
      ...room,
      ...roomTypeDetails,
      isAvailable: room.status === "available",
    };
  });
};
