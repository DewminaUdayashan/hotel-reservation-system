import type { NextApiRequest, NextApiResponse } from "next";
import { executeQuery } from "@/lib/db";

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
    const result = await executeQuery(
      "EXEC GenerateOccupancyReport @FromDate, @ToDate, @HotelId",
      [
        { name: "FromDate", value: fromDate },
        { name: "ToDate", value: toDate },
        { name: "HotelId", value: hotelId || null },
      ]
    );

    res.status(200).json({ data: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Server error" });
  }
}
