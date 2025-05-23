import type { NextApiRequest, NextApiResponse } from "next";
import { executeQuery } from "@/lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: "Invalid reservation ID" });
  }

  try {
    await executeQuery("EXEC DeleteReservation @reservationId", [
      { name: "reservationId", value: Number(id) },
    ]);

    res.status(200).json({ success: true });
  } catch (err: any) {
    console.error("Failed to delete reservation:", err);
    res.status(400).json({
      error: err.message || "Unable to delete reservation.",
    });
  }
}
