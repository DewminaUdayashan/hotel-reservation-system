import { NextApiRequest, NextApiResponse } from "next";
import { executeQuery } from "@/lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { date, hotelId } = req.query;

  try {
    const result = await executeQuery(
      `EXEC GetDashboardStats @Date = @date, @HotelId = @hotelId`,
      [
        { name: "date", value: date ?? new Date().toISOString().split("T")[0] },
        { name: "hotelId", value: hotelId ?? null },
      ]
    );

    res.status(200).json(result[0]); // Return the first row
  } catch (error) {
    console.error("Dashboard Stats API Error:", error);
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
}
