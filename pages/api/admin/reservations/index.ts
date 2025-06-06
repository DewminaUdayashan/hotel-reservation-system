import type { NextApiRequest, NextApiResponse } from "next";
import { executeQuery } from "@/lib/db";
import { getUserFromToken } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = req.headers.authorization?.split(" ")[1];
  const user = getUserFromToken(token || "");

  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const isAdmin = user.role === "admin";

  const userId = user.id;

  const {
    page = 1,
    pageSize = 10,
    search,
    hotelId: reqHotelId,
    status,
    fromDate,
    toDate,
    orderBy = "checkInDate",
    orderDir = "ASC",
  } = req.query;
  let hotelId: number | undefined = Number(reqHotelId) || undefined;

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
      "EXEC GetAllReservationsForAdmin @page, @pageSize, @search, @hotelId, @status, @fromDate, @toDate, @orderBy, @orderDir",
      [
        { name: "page", value: Number(page) },
        { name: "pageSize", value: Number(pageSize) },
        { name: "search", value: search || null },
        { name: "hotelId", value: hotelId ? Number(hotelId) : null },
        { name: "status", value: status || null },
        { name: "fromDate", value: fromDate || null },
        { name: "toDate", value: toDate || null },
        { name: "orderBy", value: orderBy },
        { name: "orderDir", value: orderDir },
      ]
    );

    const totalCount = result[0]?.totalCount || 0;

    res.status(200).json({
      data: result,
      totalCount,
    });
  } catch (err: any) {
    console.error("Admin reservations fetch failed:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
