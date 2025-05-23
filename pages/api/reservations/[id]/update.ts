import type { NextApiRequest, NextApiResponse } from "next";
import { executeQuery } from "@/lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "PUT") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const { id } = req.query;

  const {
    checkInDate,
    checkOutDate,
    numberOfGuests,
    specialRequests,
    totalAmount,
  } = req.body;

  try {
    await executeQuery(
      "EXEC UpdateReservation @reservationId, @checkInDate, @checkOutDate, @numberOfGuests, @specialRequests, @totalAmount",
      [
        { name: "reservationId", value: id },
        { name: "checkInDate", value: checkInDate },
        { name: "checkOutDate", value: checkOutDate },
        { name: "numberOfGuests", value: numberOfGuests },
        { name: "specialRequests", value: specialRequests || "" },
        { name: "totalAmount", value: totalAmount },
      ]
    );

    res.status(200).json({ success: true });
  } catch (err: any) {
    console.error("Reservation update failed:", err);
    res.status(500).json({ error: err.message || "Internal server error" });
  }
}
