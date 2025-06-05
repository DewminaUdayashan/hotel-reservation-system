import { useQuery } from "@tanstack/react-query";
import { useAxios } from "@/lib/axios";
import type { DateRange } from "react-day-picker";
import queryKeys from "../query-keys";
import { FinancialReport } from "@/lib/types/reports/types";

interface UseFinancialReportParams {
  dateRange: DateRange | undefined;
  hotelId?: number;
}

export function useFinancialReport(params: UseFinancialReportParams) {
  const axios = useAxios();

  return useQuery<FinancialReport>({
    queryKey: [queryKeys.financialReport, params],
    queryFn: async () => {
      if (!params.dateRange?.from || !params.dateRange?.to)
        return {
          dailyData: [],
          summary: {
            totalRevenue: 0,
            totalRoomRevenue: 0,
            totalServiceRevenue: 0,
            averageRevenue: 0,
          },
        };

      const res = await axios.post("/admin/reports/financial", {
        fromDate: params.dateRange.from.toISOString().split("T")[0],
        toDate: params.dateRange.to.toISOString().split("T")[0],
        hotelId: params.hotelId ?? null,
      });

      return {
        dailyData: res.data.dailyData,
        summary: res.data.summary,
      };
    },
    enabled: !!params.dateRange?.from && !!params.dateRange?.to,
  });
}
