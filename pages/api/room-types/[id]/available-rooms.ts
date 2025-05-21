import type { NextApiRequest, NextApiResponse } from "next";
import { executeQuery } from "@/lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {
    query: { id, checkIn, checkOut },
    method,
  } = req;

  if (method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: "Invalid room type ID" });
  }

  try {
    const result = await executeQuery(
      `EXEC GetAvailableRoomsByType @roomTypeId, @checkIn, @checkOut`,
      [
        { name: "roomTypeId", value: Number(id) },
        { name: "checkIn", value: checkIn || null },
        { name: "checkOut", value: checkOut || null },
      ]
    );

    res.status(200).json(result);
  } catch (err: any) {
    console.error("Error fetching available rooms by type:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
