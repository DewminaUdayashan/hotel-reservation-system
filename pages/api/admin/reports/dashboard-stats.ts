import { NextApiRequest, NextApiResponse } from "next";
import { executeQuery } from "@/lib/db";
import { get } from "http";
import { getUserFromToken } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { date, hotelId: reqHotelId } = req.query;

  let hotelId: number | undefined = Number(reqHotelId) || undefined;

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (!date) {
    return res.status(400).json({ error: "Date parameter is required" });
  }

  const token = req.headers.authorization?.split(" ")[1];
  const user = getUserFromToken(token || "");

  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const isAdmin = user.role === "admin";

  const userId = user.id;

  try {
    if (!isAdmin) {
      const query = `
      EXEC GetAssignedHotelIdByUserId @UserId = @userId;
    `;

      const hotelIds = await executeQuery(query, [
        { name: "userId", value: userId },
      ]);

      if (hotelIds.length > 0) {
        hotelId = hotelIds[0].hotelId;
      } else if (!hotelId) {
        return res.status(403).json({ error: "No hotel assigned to user" });
      }
    }

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
