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
    const result = await executeQuery("EXEC GetAllHotels");

    res.status(200).json(result);
  } catch (err: any) {
    console.error("Failed to fetch hotels:", err);
    res.status(500).json({ error: err.message || "Internal server error" });
  }
}
