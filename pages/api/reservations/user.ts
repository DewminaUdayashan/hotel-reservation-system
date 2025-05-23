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

  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    const user = getUserFromToken(token);
    if (!user?.id) return res.status(401).json({ error: "Invalid user token" });

    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;

    const result = await executeQuery(
      "EXEC GetUserReservationsPaginated @userId, @page, @pageSize",
      [
        { name: "userId", value: user.id },
        { name: "page", value: page },
        { name: "pageSize", value: pageSize },
      ]
    );

    res.status(200).json(result);
  } catch (err: any) {
    console.error("Error fetching reservations:", err);
    res.status(500).json({ error: err.message || "Internal server error" });
  }
}
