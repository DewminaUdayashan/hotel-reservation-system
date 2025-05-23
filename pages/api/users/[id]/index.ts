import type { NextApiRequest, NextApiResponse } from "next";
import { executeQuery } from "@/lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {
    query: { id },
  } = req;

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: "Invalid user ID" });
  }

  try {
    const result = await executeQuery("EXEC GetUserById @userId", [
      { name: "userId", value: Number(id) },
    ]);

    if (!result || result.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(result[0]);
  } catch (err: any) {
    console.error("Failed to get user:", err);
    res.status(500).json({ error: err.message || "Internal server error" });
  }
}
