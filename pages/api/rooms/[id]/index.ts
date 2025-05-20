import { executeQuery } from "@/lib/db";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {
    query: { id },
    method,
  } = req;

  if (method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: "Invalid room ID" });
  }

  try {
    const result = await executeQuery("EXEC GetRoomDetailsById @roomId", [
      { name: "roomId", value: Number(id) },
    ]);

    if (result.length === 0) {
      return res.status(404).json({ error: "Room not found" });
    }

    return res.status(200).json(result[0]);
  } catch (err: any) {
    console.error("Failed to fetch room:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
