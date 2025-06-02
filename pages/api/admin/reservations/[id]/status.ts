import type { NextApiRequest, NextApiResponse } from "next";
import { executeQuery } from "@/lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { id: rawId } = req.query;
  const id = parseInt(rawId as string, 10);

  const { action } = req.body;

  if (isNaN(id) || !["check-in", "check-out"].includes(action)) {
    return res.status(400).json({ error: "Invalid request data" });
  }

  try {
    const result = await executeQuery(
      "EXEC UpdateReservationStatus @ReservationId, @Action",
      [
        { name: "ReservationId", value: id },
        { name: "Action", value: action },
      ]
    );

    const updatedStatus = result[0]?.status || null;

    res.status(200).json({
      message: `Reservation status updated to ${updatedStatus}`,
      status: updatedStatus,
    });
  } catch (error: any) {
    res.status(500).json({
      error: error.message || "Failed to update reservation status",
    });
  }
}
