import { executeQuery } from "@/lib/db";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }
  const { id } = req.query;

  try {
    const query = `
      EXEC GetAssignedHotelIdByUserId @UserId = @userId;
    `;

    const hotelIds = await executeQuery(query, [{ name: "userId", value: id }]);

    res.status(200).json({ success: true, data: hotelIds });
  } catch (error) {
    console.error("Error fetching assigned hotels:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
}
