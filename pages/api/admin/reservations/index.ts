import type { NextApiRequest, NextApiResponse } from "next";
import { executeQuery } from "@/lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      page = 1,
      pageSize = 10,
      search,
      hotelId,
      status,
      fromDate,
      toDate,
      orderBy = "checkInDate",
      orderDir = "ASC",
    } = req.query;

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
