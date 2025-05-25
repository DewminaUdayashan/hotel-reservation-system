import { useAxios } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import queryKeys from "../query-keys";

export const useAdminReservations = (params: {
  page?: number;
  pageSize?: number;
  search?: string;
  hotelId?: number;
  status?: string;
  fromDate?: string;
  toDate?: string;
  orderBy?: string;
  orderDir?: "ASC" | "DESC";
}) => {
  const axios = useAxios();

  return useQuery({
    queryKey: [queryKeys.adminReservations, params],
    queryFn: async () => {
      const res = await axios.get("/admin/reservations", { params });
      return res.data;
    },
  });
};
