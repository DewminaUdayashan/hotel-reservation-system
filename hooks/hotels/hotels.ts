import { useAxios } from "@/lib/axios";
import { Hotel } from "@/lib/types/hotel";
import { useQuery } from "@tanstack/react-query";
import queryKeys from "../query-keys";

export const useAllHotels = () => {
  const axios = useAxios();
  return useQuery<Hotel[]>({
    queryKey: [queryKeys.hotels],
    queryFn: async () => {
      const res = await axios.get("/hotels");
      return res.data;
    },
  });
};
