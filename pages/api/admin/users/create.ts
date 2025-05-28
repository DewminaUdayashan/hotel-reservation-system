import type { NextApiRequest, NextApiResponse } from "next";
import { executeQuery } from "@/lib/db";
import bcrypt from "bcryptjs";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    const { email, password, firstName, lastName, role, hotelId } = req.body;

    if (!email || !password || !firstName || !lastName || !role) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await executeQuery(
      "EXEC CreateAdminUser @Email, @PasswordHash, @FirstName, @LastName, @Role",
      [
        { name: "Email", value: email },
        { name: "PasswordHash", value: hashedPassword },
        { name: "FirstName", value: firstName },
        { name: "LastName", value: lastName },
        { name: "Role", value: role },
      ]
    );

    res
      .status(201)
      .json({ message: "User created", userId: result[0]?.userId });
  } catch (error: any) {
    console.error("Error creating customer:", error);
    // Extract SQL error message if available
    const sqlErrorMessage =
      error?.originalError?.info?.message ||
      error.message ||
      "Internal server error";

    res.status(500).json({ error: sqlErrorMessage });
  }
}
