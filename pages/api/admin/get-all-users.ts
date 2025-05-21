import { verifyToken } from "@/lib/auth";
import { executeQuery } from "@/lib/db";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const user = verifyToken(req);

    if (user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden: Admins only" });
    }

    const result = await executeQuery("SELECT * FROM Users");
    res.status(200).json(result);
  } catch (err: any) {
    console.error("Access denied:", err);
    res.status(401).json({ error: err.message || "Unauthorized" });
  }
}
