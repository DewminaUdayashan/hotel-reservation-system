import { useAxios } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import queryKeys from "../query-keys";
import { DashboardStats } from "@/lib/types/reports/types";

export function useDashboardStats(date: string, hotelId?: number) {
  const axios = useAxios();
  return useQuery<DashboardStats>({
    queryKey: [queryKeys.dashboardStats, date, hotelId],
    queryFn: async () => {
      const response = await axios.get("/admin/reports/dashboard-stats", {
        params: { date, hotelId },
      });
      return response.data;
    },
  });
}
