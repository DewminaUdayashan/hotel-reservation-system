import type { NextApiRequest, NextApiResponse } from "next";
import { executeQuery } from "@/lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { id } = req.query;
  const { hotelId } = req.body;

  if (!id || !hotelId)
    return res.status(400).json({ error: "User ID and Hotel ID are required" });

  try {
    const result = await executeQuery(
      "EXEC AssignUserToHotel @UserId, @HotelId",
      [
        { name: "UserId", value: Number(id) },
        { name: "HotelId", value: Number(hotelId) },
      ]
    );

    return res
      .status(200)
      .json({ message: result[0]?.message || "Assigned successfully" });
  } catch (error: any) {
    console.error("Assign user to hotel error:", error);
    return res.status(500).json({
      error: error.message || "Internal server error",
    });
  }
}
