import { ForecastResponse } from "@/lib/types/reports/types";
import { useQuery } from "@tanstack/react-query";
import { DateRange } from "react-day-picker";
import queryKeys from "../query-keys";
import { useAxios } from "@/lib/axios";

interface RevenueByRoomTypeParams {
  dateRange: DateRange | undefined;
  hotelId?: number;
}

export const useForecastReport = ({
  dateRange,
  hotelId,
}: RevenueByRoomTypeParams) => {
  const axios = useAxios();

  return useQuery({
    queryKey: [queryKeys.forecastReport, dateRange, hotelId],
    queryFn: async () => {
      const response = await axios.get<ForecastResponse>(
        "/admin/reports/forecast",
        {
          params: { fromDate: dateRange?.from, toDate: dateRange?.to, hotelId },
        }
      );
      return response.data;
    },
    enabled: !!dateRange,
  });
};
