import type { NextApiRequest, NextApiResponse } from "next";
import { executeQuery } from "@/lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    const {
      page = "1",
      pageSize = "10",
      search = "",
      role,
      hotelId,
      orderBy = "createdAt",
      orderDir = "DESC",
    } = req.query;

    console.log("Fetching admin users with params:", req.query);

    const result = await executeQuery(
      "EXEC GetAdminUsers @page, @pageSize, @search, @role, @hotelId, @orderBy, @orderDir",
      [
        { name: "page", value: parseInt(page as string, 10) },
        { name: "pageSize", value: parseInt(pageSize as string, 10) },
        { name: "search", value: search || null },
        { name: "role", value: role || null },
        { name: "hotelId", value: hotelId ? Number(hotelId) : null },
        { name: "orderBy", value: orderBy },
        { name: "orderDir", value: orderDir },
      ]
    );

    const totalCount = result[0]?.TotalCount || 0;
    res.status(200).json({
      data: result,
      totalCount,
    });
  } catch (error: any) {
    console.error("Failed to fetch users:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}
