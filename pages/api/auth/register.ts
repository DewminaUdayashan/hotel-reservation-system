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
    const {
      email,
      password,
      firstName,
      lastName,
      role,
      phone,
      homeTown,
      agencyName,
      agencyPhone,
    } = req.body;

    if (!email || !password || !firstName || !lastName || !role || !phone) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    const result = await executeQuery(
      "EXEC RegisterUser @Email, @PasswordHash, @FirstName, @LastName, @Role, @Phone, @HomeTown, @VerificationToken, @AgencyName, @AgencyPhone",
      [
        { name: "Email", value: email },
        { name: "PasswordHash", value: passwordHash },
        { name: "FirstName", value: firstName },
        { name: "LastName", value: lastName },
        { name: "Role", value: role },
        { name: "Phone", value: phone },
        { name: "HomeTown", value: homeTown },
        { name: "VerificationToken", value: verificationToken },
        { name: "AgencyName", value: agencyName || null },
        { name: "AgencyPhone", value: agencyPhone || null },
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
          text: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f7f7f7;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
            <div style="background-color: black; color: white; padding: 20px 30px;">
              <h2 style="margin: 0; color: white">LuxeStay Hotels</h2>
            </div>
            <div style="padding: 30px;">
              <p style="font-size: 16px; color: #333;">Hi ${firstName},</p>
              <p style="font-size: 16px; color: #333;">
                Thank you for registering with <strong>LuxeStay Hotels</strong>. To complete your sign-up process, please verify your email using the code below:
              </p>
              <div style="margin: 20px 0; text-align: center;">
                <span style="font-size: 24px; font-weight: bold; color: black;">${verificationToken}</span>
              </div>
              <p style="font-size: 16px; color: #333;">
                If you did not request this, you can safely ignore this email.
              </p>
              <p style="font-size: 16px; color: #333;">Best regards,<br/>The LuxeStay Team</p>
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
