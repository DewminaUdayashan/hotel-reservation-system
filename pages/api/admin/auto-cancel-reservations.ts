import { NextApiRequest, NextApiResponse } from "next";
import { executeQuery } from "@/lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method Not Allowed" });

  try {
    const result = await executeQuery(`EXEC AutoCancelUnconfirmedReservations`);
    res
      .status(200)
      .json({ message: "Unconfirmed reservations cancelled.", result });
  } catch (error: any) {
    console.error("Auto-cancel error:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}
