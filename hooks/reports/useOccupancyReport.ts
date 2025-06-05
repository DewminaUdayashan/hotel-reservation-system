import { useQuery } from "@tanstack/react-query";
import { useAxios } from "@/lib/axios";
import type { DateRange } from "react-day-picker";
import queryKeys from "../query-keys";
import { OccupancyData } from "@/lib/types/reports/types";

type UseOccupancyReportParams = {
  dateRange: DateRange | undefined;
  hotelId?: number;
};

export function useOccupancyReport(params: UseOccupancyReportParams) {
  const axios = useAxios();

  return useQuery<OccupancyData[]>({
    queryKey: [queryKeys.occupancyReport, params],
    queryFn: async () => {
      if (!params.dateRange?.from || !params.dateRange?.to) {
        return [];
      }

      const response = await axios.post("/admin/reports/occupancy", {
        fromDate: params.dateRange.from.toISOString().split("T")[0],
        toDate: params.dateRange.to.toISOString().split("T")[0],
        hotelId: params.hotelId ?? null,
      });
      return response.data.data;
    },
    enabled: !!params.dateRange?.from && !!params.dateRange?.to,
  });
}
