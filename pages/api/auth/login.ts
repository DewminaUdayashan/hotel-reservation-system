import type { NextApiRequest, NextApiResponse } from "next";
import { executeQuery } from "../../../lib/db";
import bcrypt from "bcryptjs";
var jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"; // Use .env for production

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Fetch stored hash
    const users = await executeQuery(
      "SELECT email, passwordHash FROM Users WHERE email = @Email",
      [{ name: "Email", value: email }]
    );

    if (users.length === 0)
      return res.status(401).json({ error: "Invalid credentials" });

    const user = users[0];
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) return res.status(401).json({ error: "Invalid credentials" });

    // Fetch full user data including customer info
    const result = await executeQuery("EXEC LoginUser @Email, @PasswordHash", [
      { name: "Email", value: email },
      { name: "PasswordHash", value: user.passwordHash },
    ]);

    const fullUser = result[0];

    // Generate JWT
    const token = jwt.sign(
      {
        id: fullUser.id,
        email: fullUser.email,
        role: fullUser.role,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.status(200).json({
      message: "Login successful",
      user: fullUser,
      customer: fullUser || null,
      agency: fullUser || null,
      hotelUser: fullUser || null,
      token,
    });
  } catch (err: any) {
    console.error("Login failed:", err);
    res.status(500).json({ error: err.message || "Login failed" });
  }
}
