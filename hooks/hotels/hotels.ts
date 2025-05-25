import { useAxios } from "@/lib/axios";
import { Hotel } from "@/lib/types/hotel";
import { useQuery } from "@tanstack/react-query";

export const useAllHotels = () => {
  const axios = useAxios();
  return useQuery<Hotel[]>({
    queryKey: ["hotels"],
    queryFn: async () => {
      const res = await axios.get("/hotels");
      return res.data;
    },
  });
};
