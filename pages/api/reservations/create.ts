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

  const {
    roomId,
    checkInDate,
    checkOutDate,
    numberOfGuests,
    specialRequests,
    name,
    email,
  } = req.body;

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

    await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/send`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: email,
          subject: `Reservation Successfully Placed - LuxeStay Hotels`,
          text: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
            <div style="background-color: black; color: white; padding: 20px 30px;">
              <h2 style="margin: 0; color: white;">LuxeStay Hotels</h2>
            </div>
            <div style="padding: 30px;">
              <p style="font-size: 16px; color: #333;">Dear Guest,</p>
              <p style="font-size: 16px; color: #333;">
                Your reservation has been successfully created.
              </p>
              <p style="font-size: 16px; color: #333;">
                <strong>Reservation ID:</strong> ${result[0]?.reservationId}
              </p>
              <p style="font-size: 16px; color: #333;">
                Please keep this ID for your records. You must confirm your reservation before <strong>7PM within 24 hours</strong> to secure your booking.
              </p>
              <p style="font-size: 16px; color: #333;">
                If you have any questions or need assistance, please contact our support team at 
                <a href="mailto:support@luxestayhotels.com" style="color: #007bff;">support@luxestayhotels.com</a>.
              </p>
              <p style="font-size: 16px; color: #333;">We look forward to welcoming you.</p>
              <p style="font-size: 16px; color: #333;">Warm regards,<br/>The LuxeStay Team</p>
            </div>
            <div style="background-color: #f1f1f1; text-align: center; padding: 15px; font-size: 12px; color: #888;">
              &copy; ${new Date().getFullYear()} LuxeStay Hotels. All rights reserved.
            </div>
          </div>
        </div>
      `,
        }),
      }
    );

    res.status(200).json({ reservationId: result[0]?.reservationId });
  } catch (err: any) {
    console.error("Error creating reservation:", err);
    res.status(500).json({ error: err.message || "Internal server error" });
  }
}
