import { useAxios } from "@/lib/axios";
import { AdminReservationResponse } from "@/lib/types/reservation";
import { useQuery } from "@tanstack/react-query";

type AdminReservationFilters = {
  page?: number;
  pageSize?: number;
  search?: string;
  hotelId?: number;
  status?: string;
  fromDate?: string; // ISO string
  toDate?: string; // ISO string
  orderBy?: string;
  orderDir?: "ASC" | "DESC";
};

export const useAdminReservations = (filters: AdminReservationFilters) => {
  const axios = useAxios();

  return useQuery<AdminReservationResponse>({
    queryKey: ["admin-reservations", filters],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (filters.page) params.append("page", filters.page.toString());
      if (filters.pageSize)
        params.append("pageSize", filters.pageSize.toString());
      if (filters.search) params.append("search", filters.search);
      if (filters.hotelId) params.append("hotelId", filters.hotelId.toString());
      if (filters.status) params.append("status", filters.status);
      if (filters.fromDate) params.append("fromDate", filters.fromDate);
      if (filters.toDate) params.append("toDate", filters.toDate);
      if (filters.orderBy) params.append("orderBy", filters.orderBy);
      if (filters.orderDir) params.append("orderDir", filters.orderDir);

      const res = await axios.get<AdminReservationResponse>(
        `/admin/reservations?${params.toString()}`
      );
      return res.data;
    },
    enabled: !!filters,
  });
};
