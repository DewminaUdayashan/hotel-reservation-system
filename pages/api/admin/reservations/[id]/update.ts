import type { NextApiRequest, NextApiResponse } from "next";
import { executeQuery } from "@/lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { id } = req.query;

    const {
      checkInDate,
      checkOutDate,
      numberOfGuests,
      specialRequests,
      cardHolderName,
      maskedCardNumber,
      cardType,
      expiryMonth,
      expiryYear,
      bankName,
    } = req.body;

    if (!id || !checkInDate || !checkOutDate || !numberOfGuests) {
      return res
        .status(400)
        .json({ error: "Missing required reservation fields." });
    }

    await executeQuery(
      "EXEC UpdateReservationAdmin @reservationId, @checkInDate, @checkOutDate, @numberOfGuests, @specialRequests, @cardHolderName, @maskedCardNumber, @cardType, @expiryMonth, @expiryYear, @bankName",
      [
        { name: "reservationId", value: id },
        { name: "checkInDate", value: checkInDate },
        { name: "checkOutDate", value: checkOutDate },
        { name: "numberOfGuests", value: numberOfGuests },
        { name: "specialRequests", value: specialRequests || null },
        { name: "cardHolderName", value: cardHolderName || null },
        { name: "maskedCardNumber", value: maskedCardNumber || null },
        { name: "cardType", value: cardType || null },
        { name: "expiryMonth", value: expiryMonth || null },
        { name: "expiryYear", value: expiryYear || null },
        { name: "bankName", value: bankName || null },
      ]
    );

    return res
      .status(200)
      .json({ message: "Reservation updated successfully." });
  } catch (error: any) {
    console.error("Update failed:", error);
    return res
      .status(500)
      .json({ error: error.message || "Internal Server Error" });
  }
}
