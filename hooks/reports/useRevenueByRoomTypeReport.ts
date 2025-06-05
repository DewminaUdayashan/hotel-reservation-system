import { RevenueByRoomTypeReport } from "@/lib/types/reports/types";
import { useQuery } from "@tanstack/react-query";
import queryKeys from "../query-keys";
import { DateRange } from "react-day-picker";
import { useAxios } from "@/lib/axios";

interface RevenueByRoomTypeParams {
  dateRange: DateRange | undefined;
  hotelId?: number;
}

export const useRevenueByRoomTypeReport = ({
  dateRange,
  hotelId,
}: RevenueByRoomTypeParams) => {
  const axios = useAxios();

  return useQuery<RevenueByRoomTypeReport[]>({
    queryKey: [
      queryKeys.revenueByRoomType,
      dateRange?.from,
      dateRange?.to,
      hotelId,
    ],
    queryFn: async () => {
      const response = await axios.get<RevenueByRoomTypeReport[]>(
        "/admin/reports/revenue-by-room-type",
        {
          params: { from: dateRange?.from, to: dateRange?.to, hotelId },
        }
      );
      return response.data;
    },
    enabled: !!dateRange && !!dateRange,
  });
};
