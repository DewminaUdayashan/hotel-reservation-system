import { NextApiRequest, NextApiResponse } from "next";
import { executeQuery } from "@/lib/db"; // Adjust path based on your project
import { parseISO } from "date-fns";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const from = req.query.from as string;
    const to = req.query.to as string;
    const hotelId = req.query.hotelId
      ? parseInt(req.query.hotelId as string)
      : null;

    const result = await executeQuery(
      `EXEC GenerateRevenueByRoomTypeReport @FromDate = @fromDate, @ToDate = @toDate, @HotelId = @hotelId`,
      [
        { name: "fromDate", value: parseISO(from) },
        { name: "toDate", value: parseISO(to) },
        { name: "hotelId", value: hotelId },
      ]
    );

    res.status(200).json(result);
  } catch (error) {
    console.error("Revenue by Room Type error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
