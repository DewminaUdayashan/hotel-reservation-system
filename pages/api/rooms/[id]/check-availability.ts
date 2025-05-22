import type { NextApiRequest, NextApiResponse } from "next";
import { executeQuery } from "@/lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {
    query: { id, checkIn, checkOut, userId },
    method,
  } = req;

  if (method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const result = await executeQuery(
      "EXEC IsRoomAvailable @roomId, @checkIn, @checkOut, @userId",
      [
        { name: "roomId", value: Number(id) },
        { name: "checkIn", value: checkIn || null },
        { name: "checkOut", value: checkOut || null },
        { name: "userId", value: userId ? Number(userId) : null },
      ]
    );

    const isAvailable = result[0]?.isAvailable ?? false;

    res.status(200).json({ isAvailable });
  } catch (err: any) {
    console.error("Availability check failed:", err);
    res.status(500).json({ error: err.message || "Internal server error" });
  }
}
