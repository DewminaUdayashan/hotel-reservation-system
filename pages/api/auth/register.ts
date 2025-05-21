import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import { executeQuery } from "../../../lib/db";
var jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"; // Load from .env in production

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email, password, firstName, lastName, role, phone, homeTown } =
      req.body;

    if (!email || !password || !firstName || !lastName || !role || !phone) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    const result = await executeQuery(
      "EXEC RegisterUser @Email, @PasswordHash, @FirstName, @LastName, @Role, @Phone, @HomeTown",
      [
        { name: "Email", value: email },
        { name: "PasswordHash", value: passwordHash },
        { name: "FirstName", value: firstName },
        { name: "LastName", value: lastName },
        { name: "Role", value: role },
        { name: "Phone", value: phone },
        { name: "HomeTown", value: homeTown },
      ]
    );

    const userId = result[0]?.userId;

    if (!userId) throw new Error("Registration failed");

    // Construct user object for frontend
    const newUser = {
      id: userId,
      email,
      firstName,
      lastName,
      role,
      phone,
      homeTown,
      createdAt: new Date().toISOString(),
    };

    // Generate JWT token
    const token = jwt.sign({ id: userId, email, role }, JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.status(200).json({
      message: "User registered successfully",
      user: newUser,
      token,
    });
  } catch (err: any) {
    console.error("Registration error:", err);
    return res
      .status(500)
      .json({ error: err.message || "Internal server error" });
  }
}
