import type { NextApiRequest, NextApiResponse } from "next";
import { executeQuery } from "@/lib/db";
import { getUserFromToken } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  const user = getUserFromToken(token);
  if (!user?.id) return res.status(401).json({ error: "Invalid user token" });

  const { roomId, checkInDate, checkOutDate, numberOfGuests, specialRequests } =
    req.body;

  if (!roomId || !checkInDate || !checkOutDate || !numberOfGuests) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const result = await executeQuery(
      "EXEC ReserveRoom @customerId, @roomId, @checkInDate, @checkOutDate, @numberOfGuests, @specialRequests",
      [
        { name: "customerId", value: user.id },
        { name: "roomId", value: roomId },
        { name: "checkInDate", value: checkInDate },
        { name: "checkOutDate", value: checkOutDate },
        { name: "numberOfGuests", value: numberOfGuests },
        { name: "specialRequests", value: specialRequests || null },
      ]
    );

    res.status(200).json({ reservationId: result[0]?.reservationId });
  } catch (err: any) {
    console.error("Error creating reservation:", err);
    res.status(500).json({ error: err.message || "Internal server error" });
  }
}
