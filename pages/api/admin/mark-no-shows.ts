import type { NextApiRequest, NextApiResponse } from "next";
import { executeQuery } from "../../../lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, message: "Method not allowed" });
  }

  try {
    await executeQuery("EXEC MarkReservationsAsNoShowAndInvoice");
    return res
      .status(200)
      .json({ success: true, message: "No-show reservations processed." });
  } catch (error: any) {
    console.error("Error processing no-show reservations:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
