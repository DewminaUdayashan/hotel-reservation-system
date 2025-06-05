import type { NextApiRequest, NextApiResponse } from "next";
import { executeQuery, executeQueryForRecordSets } from "@/lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { fromDate, toDate, hotelId } = req.body;

  if (!fromDate || !toDate) {
    return res.status(400).json({ error: "Missing required date range" });
  }

  try {
    const result = await executeQueryForRecordSets(
      "EXEC GenerateNoShowReport @FromDate, @ToDate, @HotelId",
      [
        { name: "FromDate", value: fromDate },
        { name: "ToDate", value: toDate },
        { name: "HotelId", value: hotelId || null },
      ]
    );

    const dailyData = result[0] || [];
    const summary = result[1]?.[0] || {
      totalReservations: 0,
      totalNoShows: 0,
      averageNoShowRate: 0,
      totalRevenueLost: 0,
    };

    res.status(200).json({ dailyData, summary });
  } catch (error: any) {
    res
      .status(500)
      .json({ error: error.message || "Failed to generate no-show report" });
  }
}
