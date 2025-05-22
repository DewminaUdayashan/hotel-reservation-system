import { useAxios } from "@/lib/axios";
import {
  ReservationWithAdditionalDetails,
  ReserveRoomInput,
} from "@/lib/types/reservation";
import { useMutation, useQuery } from "@tanstack/react-query";
import queryKeys from "../query-keys";
import { useQueryClient } from "@tanstack/react-query";

export const useReserveRoom = () => {
  const axios = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ReserveRoomInput): Promise<number> => {
      const res = await axios.post("/reservations/create", data);
      return res.data.reservationId;
    },
    onSuccess: () => {
      // Invalidate the reservations query to refetch the data
      queryClient.invalidateQueries({ queryKey: [queryKeys.userReservations] });
    },
  });
};

export const useUserReservations = (page = 1, pageSize = 10) => {
  const axios = useAxios();

  return useQuery<ReservationWithAdditionalDetails[]>({
    queryKey: [queryKeys.userReservations, page, pageSize],
    queryFn: async () => {
      const res = await axios.get("/reservations/user", {
        params: { page, pageSize },
      });
      return res.data;
    },
  });
};
