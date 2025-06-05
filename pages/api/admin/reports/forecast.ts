import type { NextApiRequest, NextApiResponse } from "next";
import { executeQuery, executeQueryForRecordSets } from "@/lib/db"; // your wrapper
import { ForecastResponse } from "@/lib/types/reports/types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ForecastResponse>
) {
  try {
    const { fromDate, toDate, hotelId } = req.query;

    const result = await executeQueryForRecordSets(
      "EXEC GenerateForecastOccupancyReport @FromDate = @fromDate, @ToDate = @toDate, @HotelId = @hotelId",
      [
        { name: "fromDate", value: fromDate },
        { name: "toDate", value: toDate },
        { name: "hotelId", value: hotelId ? Number(hotelId) : null },
      ]
    );

    const notEnoughData =
      result.length === 1 && result[0].notEnoughData === true;

    res.status(200).json({
      success: true,
      data: notEnoughData ? [] : result[0],
      notEnoughData,
    });
  } catch (error) {
    console.error("Forecast API error", error);
    res.status(500).json({ success: false, data: [], notEnoughData: false });
  }
}
