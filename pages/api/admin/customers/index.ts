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
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const search = req.query.search?.toString() || null;
    const customerType = req.query.customerType?.toString() || null;
    const orderBy = req.query.orderBy?.toString() || "createdAt";
    const orderDir = req.query.orderDir?.toString() || "DESC";

    const result = await executeQuery(
      "EXEC GetAllCustomersAdmin @page, @pageSize, @search, @customerType, @orderBy, @orderDir",
      [
        { name: "page", value: page },
        { name: "pageSize", value: pageSize },
        { name: "search", value: search },
        { name: "customerType", value: customerType },
        { name: "orderBy", value: orderBy },
        { name: "orderDir", value: orderDir },
      ]
    );

    const totalCount = result[0]?.TotalCount || 0;

    res.status(200).json({
      data: result,
      totalCount,
    });
  } catch (err: any) {
    console.error("Failed to fetch customers:", err);
    res.status(500).json({ error: err.message || "Internal server error" });
  }
}
