import type { NextApiRequest, NextApiResponse } from "next";
import { executeQuery } from "@/lib/db";

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
    const images = await executeQuery("EXEC GetRoomImages @roomId", [
      { name: "roomId", value: Number(id) },
    ]);

    res.status(200).json(images);
  } catch (err: any) {
    console.error("Error fetching room images:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
