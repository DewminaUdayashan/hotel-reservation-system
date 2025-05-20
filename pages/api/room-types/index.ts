import type { NextApiRequest, NextApiResponse } from "next";
import { executeQuery } from "../../../lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const result = await executeQuery("EXEC GetAllRoomTypes");

    res.status(200).json(result);
  } catch (err: any) {
    console.error("Failed to fetch room types:", err);
    res.status(500).json({ error: "Failed to fetch room types" });
  }
}
