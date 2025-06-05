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

  const { action, userName, email } = req.body;

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

    await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/send`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: email,
          subject: `You have just Checked ${action === "check-in" ? "In" : "Out"} at LuxeStay Hotels`,
          text: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
            <div style="background-color: black; color: white; padding: 20px 30px;">
              <h2 style="margin: 0; color: white;">LuxeStay Hotels</h2>
            </div>
            <div style="padding: 30px;">
              <p style="font-size: 16px; color: #333;">Dear ${userName},</p>
              <p style="font-size: 16px; color: #333;">
                ${
                  action === "check-in"
                    ? "Thank you for checking in at <strong>LuxeStay Hotels</strong>. We’re delighted to welcome you and wish you a relaxing and memorable stay."
                    : "Thank you for checking out from <strong>LuxeStay Hotels</strong>. We hope you had a wonderful stay and look forward to welcoming you again soon."
                }
              </p>
              <p style="font-size: 16px; color: #333;">
                If you have any feedback or questions, feel free to reach out to us.
              </p>
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
