import { useQuery } from "@tanstack/react-query";
import queryKeys from "./query-keys";
import { useAuth } from "@/hooks/auth/useAuth"; // Import useAuth
import axiosInstance from "@/lib/axios"; // Import axiosInstance
import { Reservation } from "@/lib/types/reservation"; // Import Reservation type

const useReservations = () => {
  const { user, isAdmin } = useAuth();

  return useQuery<Reservation[], Error>({ // Specify types for data and error
    queryKey: [queryKeys.reservations, isAdmin ? "admin" : user?.id],
    queryFn: async () => {
      const url = isAdmin ? "/admin/reservations" : "/reservations";
      const response = await axiosInstance.get(url);
      return response.data;
    },
    enabled: !!user, // Only run query if user is logged in
  });
};

const useReservation = (id?: number | string) => { // id can be string from URL params
  const { user } = useAuth();

  return useQuery<Reservation, Error>({ // Specify types for data and error
    queryKey: [queryKeys.reservations, id],
    queryFn: async () => {
      if (!id) throw new Error("Reservation ID is required"); // Or handle appropriately
      const response = await axiosInstance.get(`/reservations/${id}`);
      return response.data;
    },
    enabled: !!user && !!id, // Only run query if user is logged in and id is provided
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
