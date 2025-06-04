import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import { executeQuery } from "../../../lib/db";
import { generateCode } from "@/lib/utils/code";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const verificationToken = generateCode();

  try {
    const { email, password, firstName, lastName, role, phone, homeTown } =
      req.body;

    if (!email || !password || !firstName || !lastName || !role || !phone) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    const result = await executeQuery(
      "EXEC RegisterUser @Email, @PasswordHash, @FirstName, @LastName, @Role, @Phone, @HomeTown, @VerificationToken",
      [
        { name: "Email", value: email },
        { name: "PasswordHash", value: passwordHash },
        { name: "FirstName", value: firstName },
        { name: "LastName", value: lastName },
        { name: "Role", value: role },
        { name: "Phone", value: phone },
        { name: "HomeTown", value: homeTown },
        { name: "VerificationToken", value: verificationToken },
      ]
    );

    const userId = result[0]?.userId;

    if (!userId) throw new Error("Registration failed");

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
          text: `Hi ${firstName}, please verify your email for LuxeStay Hotels using the following token: ${verificationToken}`,
        }),
      }
    );

    // Construct user object for frontend
    const newUser = {
      id: userId,
      email,
      firstName,
      lastName,
      role,
      phone,
      homeTown,
      isEmailVerified: false,
      mustResetPassword: false,
      createdAt: new Date().toISOString(),
    };

    return res.status(200).json({
      message: "User registered successfully",
      user: newUser,
    });
  } catch (err: any) {
    console.error("Registration error:", err);
    return res
      .status(500)
      .json({ error: err.message || "Internal server error" });
  }
}
