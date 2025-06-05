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

    await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/send`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: email,
          subject: "Welcome to LuxeStay Hotels",
          text: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
            <div style="background-color: black; color: white; padding: 20px 30px;">
              <h2 style="margin: 0; color: white">Welcome to LuxeStay Hotels</h2>
            </div>
            <div style="padding: 30px;">
              <p style="font-size: 16px; color: #333;">Hello from LuxeStay,</p>
              <p style="font-size: 16px; color: #333;">
                Thank you for verifying your email and joining LuxeStay Hotels — a growing hospitality brand based in Sri Lanka, offering a blend of comfort, elegance, and personalized service.
              </p>
              <p style="font-size: 16px; color: #333;">
                Our website allows you to:
              </p>
              <ul style="font-size: 16px; color: #333; padding-left: 20px; margin-bottom: 20px;">
                <li>Make hotel room reservations across our properties in Sri Lanka</li>
                <li>Book luxurious residential suites for extended stays</li>
                <li>Submit block booking requests for travel agencies</li>
              </ul>
              <p style="font-size: 16px; color: #333;">
                You can now explore our offerings and begin planning your next stay. Visit our website here:
              </p>
              <p style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}" 
                   style="display: inline-block; font-size: 16px; color: #007bff; text-decoration: underline;">
                  ${process.env.NEXT_PUBLIC_BASE_URL || "Visit LuxeStay Hotels Website"}
                </a>
              </p>
              <p style="font-size: 16px; color: #333;">
                We’re excited to be a part of your next journey.
              </p>
              <p style="font-size: 16px; color: #333;">Warm regards,<br/>The LuxeStay Team</p>
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

    res.status(200).json({ message: "Email verified successfully" });
  } catch (err: any) {
    return res
      .status(400)
      .json({ error: err.message || "Email verification failed" });
  }
}
