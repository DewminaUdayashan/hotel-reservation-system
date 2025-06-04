import type { NextApiRequest, NextApiResponse } from "next";
import { executeQuery } from "../../../lib/db";
import { generateCode } from "@/lib/utils/code";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email, token: tmpToken, user } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Missing email" });
    }
    let token = tmpToken;
    if (!token) {
      // Generate a new token if not provided
      token = generateCode();
    }

    await executeQuery("EXEC UpdateVerificationToken @Email, @NewToken", [
      { name: "Email", value: email },
      { name: "NewToken", value: token },
    ]);

    // Call /api/send to send verification email
    await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/send`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: email,
          subject: "Verify your email",
          text: `Hi ${user}, please verify your email for LuxeStay Hotels using the following token: ${token}`,
        }),
      }
    );

    return res
      .status(200)
      .json({ message: "Verification token updated successfully" });
  } catch (err: any) {
    console.error("Token update error:", err);
    return res
      .status(500)
      .json({ error: err.message || "Internal server error" });
  }
}
