// pages/api/room-types/[id]/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { executeQuery } from "@/lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const roomTypeId = parseInt(req.query.id as string);

  if (isNaN(roomTypeId)) {
    return res.status(400).json({ error: "Invalid roomTypeId" });
  }

  try {
    const result = await executeQuery(
      "EXEC GetRoomTypeById @RoomTypeId = @id",
      [{ name: "id", value: roomTypeId }]
    );

    if (!result || result.length === 0) {
      return res.status(404).json({ error: "Room type not found" });
    }

    res.status(200).json(result[0]);
  } catch (err) {
    console.error("Failed to fetch room type:", err);
    res.status(500).json({ error: "Failed to fetch room type" });
  }
}
