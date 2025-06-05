import { useQuery } from "@tanstack/react-query";
import { useAxios } from "@/lib/axios";
import type { DateRange } from "react-day-picker";
import { NoShowReport } from "@/lib/types/reports/types";
import queryKeys from "../query-keys";

interface UseNoShowReportParams {
  dateRange: DateRange | undefined;
  hotelId?: number;
}

export function useNoShowReport(params: UseNoShowReportParams) {
  const axios = useAxios();

  return useQuery<NoShowReport>({
    queryKey: [queryKeys.noShowReport, params],
    queryFn: async () => {
      if (!params.dateRange?.from || !params.dateRange?.to) {
        return {
          dailyData: [],
          summary: {
            totalReservations: 0,
            totalNoShows: 0,
            averageNoShowRate: 0,
            totalRevenueLost: 0,
          },
        };
      }

      const res = await axios.post("/admin/reports/no-show", {
        fromDate: params.dateRange.from.toISOString().split("T")[0],
        toDate: params.dateRange.to.toISOString().split("T")[0],
        hotelId: params.hotelId ?? null,
      });

      return {
        dailyData: res.data.dailyData.map((item: any) => ({
          ...item,
          date: new Date(item.reportDate),
        })),
        summary: res.data.summary,
      };
    },
    enabled: !!params.dateRange?.from && !!params.dateRange?.to,
  });
}
