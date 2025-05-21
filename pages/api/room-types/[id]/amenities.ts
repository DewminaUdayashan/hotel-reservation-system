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
      "EXEC GetAmenitiesByRoomTypeId @RoomTypeId = @id",
      [{ name: "id", value: roomTypeId }]
    );
    res.status(200).json(result);
  } catch (error) {
    console.error("Failed to fetch amenities:", error);
    res.status(500).json({ error: "Failed to fetch amenities" });
  }
}
