import { useAxios } from "@/lib/axios";
import { ReserveRoomInput } from "@/lib/types/reservation";
import { useMutation } from "@tanstack/react-query";

export const useReserveRoom = () => {
  const axios = useAxios();

  return useMutation({
    mutationFn: async (data: ReserveRoomInput): Promise<number> => {
      const res = await axios.post("/reservations/create", data);
      return res.data.reservationId;
    },
  });
};
