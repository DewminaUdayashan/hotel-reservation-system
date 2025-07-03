import type { NextApiRequest, NextApiResponse } from "next";
import { executeQuery, executeTVPQuery, sql } from "@/lib/db";
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

  const {
    agencyId,
    roomIds,
    checkInDate,
    checkOutDate,
    numberOfGuests,
    specialRequests,
    discountPercentage,
    email,
    customerId,

    cardHolderName,
    cardNumber,
    cardExpiryMonth,
    cardExpiryYear,
    cardCVC,
  } = req.body;

  if (
    !agencyId ||
    !roomIds ||
    !Array.isArray(roomIds) ||
    roomIds.length === 0 ||
    !checkInDate ||
    !checkOutDate ||
    !numberOfGuests ||
    !cardHolderName ||
    !cardNumber ||
    !cardExpiryMonth ||
    !cardExpiryYear
  ) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // Prepare TVP (table-valued parameter)
    const roomIdTable = new sql.Table();
    roomIdTable.columns.add("roomId", sql.Int);
    roomIds.forEach((id: number) => roomIdTable.rows.add(id));

    const result = await executeTVPQuery(
      "ReserveBlockBooking",
      [
        { name: "agencyId", value: agencyId, type: sql.Int },
        { name: "roomIdTable", value: roomIdTable, type: sql.TVP }, // 👈 TVP support
        { name: "checkInDate", value: checkInDate, type: sql.Date },
        { name: "checkOutDate", value: checkOutDate, type: sql.Date },
        { name: "numberOfGuests", value: numberOfGuests, type: sql.Int },
        {
          name: "specialRequests",
          value: specialRequests || null,
          type: sql.NVarChar(sql.MAX),
        },
        {
          name: "discountPercentage",
          value: discountPercentage || 0,
          type: sql.Int,
        },
        { name: "email", value: email || null, type: sql.NVarChar(255) },
        { name: "customerId", value: customerId || null, type: sql.Int },
        { name: "cardNumber", value: cardNumber, type: sql.NVarChar(25) },
        { name: "cardExpiryMonth", value: cardExpiryMonth, type: sql.Int },
        { name: "cardExpiryYear", value: cardExpiryYear, type: sql.Int },
        { name: "cardCVC", value: cardCVC || null, type: sql.NVarChar(10) },
        {
          name: "cardHolderName",
          value: cardHolderName,
          type: sql.NVarChar(100),
        },
      ],
      true
    );

    const message = result?.[0]?.message || "Block booking completed";

    if (email) {
      await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/send`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: email,
            subject: `Block Booking Confirmed - LuxeStay Hotels`,
            text: `
              <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2>LuxeStay Hotels - Block Booking</h2>
                <p>Your block booking was successfully created and confirmed.</p>
                <p><strong>Confirmation:</strong> ${message}</p>
                <p>Thank you for choosing LuxeStay. We look forward to hosting your group!</p>
              </div>
            `,
          }),
        }
      );
    }

    res.status(200).json({ message });
  } catch (err: any) {
    console.error("Block booking error:", err);
    res.status(500).json({ error: err.message || "Internal server error" });
  }
}
