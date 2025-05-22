import { useAxios } from "@/lib/axios";
import {
  ReservationDetails,
  ReservationWithAdditionalDetails,
  ReserveRoomInput,
  UpdateReservationInput,
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

export const useReservationById = (reservationId?: number) => {
  const axios = useAxios();

  return useQuery<ReservationDetails>({
    queryKey: [queryKeys.reservations, reservationId],
    queryFn: async () => {
      const res = await axios.get(`/reservations/${reservationId}`);
      return res.data;
    },
    enabled: !!reservationId,
  });
};

export const useUpdateReservation = (id: number) => {
  const axios = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateReservationInput) => {
      const res = await axios.put(
        `/reservations/${data.reservationId}/update`,
        data
      );
      return res.data;
    },
    onSuccess: () => {
      // Invalidate the reservations query to refetch the data
      queryClient.invalidateQueries({ queryKey: [queryKeys.reservations, id] });
    },
  });
};
