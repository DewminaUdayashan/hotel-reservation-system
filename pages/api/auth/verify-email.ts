import type { NextApiRequest, NextApiResponse } from "next";
import { executeQuery } from "../../../lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email, token } = req.body;

    if (!email || !token) {
      return res.status(400).json({ error: "Email and token are required" });
    }

    await executeQuery("EXEC VerifyUserEmail @Email, @Token", [
      { name: "Email", value: email },
      { name: "Token", value: token },
    ]);

    res.status(200).json({ message: "Email verified successfully" });
  } catch (err: any) {
    console.error("Email verification error:", err);
    return res
      .status(400)
      .json({ error: err.message || "Email verification failed" });
  }
}
