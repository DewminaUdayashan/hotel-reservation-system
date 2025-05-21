import type { NextApiRequest, NextApiResponse } from "next";
import { executeQuery } from "../../../lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { checkIn, checkOut, type, capacity, minPrice, maxPrice } = req.query;

    const result = await executeQuery(
      `EXEC GetAvailableRoomsWithFilters 
        @checkIn = @checkIn, 
        @checkOut = @checkOut, 
        @type = @type, 
        @capacity = @capacity, 
        @minPrice = @minPrice, 
        @maxPrice = @maxPrice`,
      [
        { name: "checkIn", value: checkIn || null },
        { name: "checkOut", value: checkOut || null },
        { name: "type", value: type || null },
        { name: "capacity", value: capacity || null },
        { name: "minPrice", value: minPrice || null },
        { name: "maxPrice", value: maxPrice || null },
      ]
    );

    res.status(200).json(result);
  } catch (err: any) {
    console.error("Error fetching available rooms:", err);
    res.status(500).json({ error: err.message || "Server error" });
  }
}
