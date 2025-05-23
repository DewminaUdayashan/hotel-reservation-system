import type { NextApiRequest, NextApiResponse } from "next";
import { executeQuery } from "@/lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: "Invalid reservation ID" });
  }

  try {
    const result = await executeQuery(
      "EXEC GetReservationById @reservationId",
      [{ name: "reservationId", value: Number(id) }]
    );

    if (!result || result.length === 0) {
      return res.status(404).json({ error: "Reservation not found" });
    }

    res.status(200).json(result[0]);
  } catch (err: any) {
    console.error("Failed to get reservation:", err);
    res.status(500).json({ error: err.message || "Internal server error" });
  }
}
