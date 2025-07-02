import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import { executeQuery } from "../../../lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({
        error:
          "Missing required fields: email, oldPassword, and newPassword are required.",
      });
    }

    const userResult = await executeQuery(
      "SELECT id FROM Users WHERE email = @Email AND isActive = 1",
      [{ name: "Email", value: email }]
    );

    const user = userResult[0];

    if (!user) {
      return res
        .status(404)
        .json({ error: "User not found or account is inactive." });
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    const updateResult = await executeQuery(
      "EXEC ChangeUserPassword @Email, @NewPasswordHash",
      [
        { name: "Email", value: email },
        { name: "NewPasswordHash", value: newPasswordHash },
      ]
    );

    const resultStatus = updateResult[0]?.Status;

    if (resultStatus !== "Success") {
      throw new Error(
        updateResult[0]?.Message || "Failed to update password in database."
      );
    }

    return res
      .status(200)
      .json({ message: "Password has been changed successfully." });
  } catch (err: any) {
    console.error("Password change error:", err);
    return res
      .status(500)
      .json({ error: err.message || "Internal server error" });
  }
}
