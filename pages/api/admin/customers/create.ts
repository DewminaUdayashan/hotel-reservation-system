import type { NextApiRequest, NextApiResponse } from "next";
import { executeQuery } from "@/lib/db";
import bcrypt from "bcryptjs";
import crypto from "crypto";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const {
    email,
    firstName,
    lastName,
    phone,
    homeTown,
    customerType = "individual",
    agencyId,
    agencyName,
    agencyPhone,
  } = req.body;

  if (!email || !firstName || !lastName || !phone) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // Generate a secure random password
    const rawPassword = crypto.randomBytes(8).toString("hex"); // 16-char password
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    let finalAgencyId = agencyId;

    // If customer is agency and agencyId not provided, create agency first
    if (customerType === "agency" && !finalAgencyId) {
      if (!agencyName || !agencyPhone) {
        return res.status(400).json({
          error: "Agency name and phone are required for agency type.",
        });
      }

      const agencyResult = await executeQuery(
        `INSERT INTO Agencies (name, phone) OUTPUT INSERTED.id VALUES (@name, @phone)`,
        [
          { name: "name", value: agencyName },
          { name: "phone", value: agencyPhone },
        ]
      );

      finalAgencyId = agencyResult[0]?.id;
      if (!finalAgencyId) {
        return res.status(500).json({ error: "Failed to create agency." });
      }
    }

    const result = await executeQuery(
      "EXEC CreateCustomer @email, @passwordHash, @firstName, @lastName, @phone, @homeTown, @customerType, @agencyId",
      [
        { name: "email", value: email },
        { name: "passwordHash", value: hashedPassword },
        { name: "firstName", value: firstName },
        { name: "lastName", value: lastName },
        { name: "phone", value: phone },
        { name: "homeTown", value: homeTown || null },
        { name: "customerType", value: customerType },
        { name: "agencyId", value: finalAgencyId || null },
        { name: "mustResetPassword", value: true },
      ]
    );

    res.status(201).json({
      message: "Customer created successfully.",
      customerId: result[0]?.customerId,
      rawPassword,
    });
  } catch (error: any) {
    // Extract SQL error message if available
    const sqlErrorMessage =
      error?.originalError?.info?.message ||
      error.message ||
      "Internal server error";

    res.status(500).json({ error: sqlErrorMessage });
  }
}

export default handler;
