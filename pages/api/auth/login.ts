import type { NextApiRequest, NextApiResponse } from "next";
import { executeQuery } from "../../../lib/db";
import bcrypt from "bcryptjs";
var jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: "Email and password are required" });

  try {
    const result = await executeQuery("EXEC LoginUser @Email", [
      { name: "Email", value: email },
    ]);

    const user = result[0];

    if (!user || !user.passwordHash) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    // Remove passwordHash before sending response
    delete user.passwordHash;

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        createdAt: user.createdAt,
        isActive: user.isActive,
      },
      customer: user.customerId
        ? {
            id: user.customerId,
            phone: user.phone,
            homeTown: user.homeTown,
            customerType: user.customerType,
            agencyId: user.agencyId,
          }
        : null,
      agency: user.agencyId
        ? {
            id: user.agencyId,
            name: user.agencyName,
            phone: user.agencyPhone,
            createdAt: user.agencyCreatedAt,
          }
        : null,
      hotelUser: user.hotelUserId
        ? {
            id: user.hotelUserId,
            hotelId: user.hotelId,
            hotelName: user.hotelName,
          }
        : null,
      token,
    });
  } catch (err: any) {
    const sqlErrorMessage = err.originalError?.info?.message;
    const message = sqlErrorMessage || err.message || "Login failed";

    res.status(500).json({ error: message });
  }
}
