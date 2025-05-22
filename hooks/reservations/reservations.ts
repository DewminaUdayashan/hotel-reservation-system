import { useAxios } from "@/lib/axios";
import {
  Reservation,
  ReservationWithAdditionalDetails,
  ReserveRoomInput,
} from "@/lib/types/reservation";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useReserveRoom = () => {
  const axios = useAxios();

  return useMutation({
    mutationFn: async (data: ReserveRoomInput): Promise<number> => {
      const res = await axios.post("/reservations/create", data);
      return res.data.reservationId;
    },
  });
};

export const useUserReservations = (page = 1, pageSize = 10) => {
  const axios = useAxios();

  return useQuery<ReservationWithAdditionalDetails[]>({
    queryKey: ["userReservations", page, pageSize],
    queryFn: async () => {
      const res = await axios.get("/reservations/user", {
        params: { page, pageSize },
      });
      return res.data;
    },
  });
};
