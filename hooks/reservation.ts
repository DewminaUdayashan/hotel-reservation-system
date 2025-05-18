import { useQuery } from "@tanstack/react-query";
import queryKeys from "./query-keys";
import { delay } from "@/lib/api";
import { reservations } from "@/lib/data";

const useReservations = () => {
  return useQuery({
    queryKey: [queryKeys.reservations],
    queryFn: async () => {
      // Simulate async fetch
      // await delay(300);
      return reservations;
    },
  });
};

const useReservation = (id: number) => {
  return useQuery({
    queryKey: [queryKeys.reservations, id],
    queryFn: async () => {
      await delay(200);
      const reservation = reservations.find((r) => r.id === id);
      if (!reservation) throw new Error("Reservation not found");
      return reservation;
    },
    enabled: !!id,
  });
};

export {
  useReservations,
  useReservation,
  // useAvailableRooms,
  // useRoomTypes,
  // useRoomType,
  // useRooms,
  // useRoom,
  // useCustomer,
  // useCustomers,
};
