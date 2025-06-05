import type { NextApiRequest, NextApiResponse } from "next";
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { to, subject, text } = req.body;

  if (!to || !subject || !text) {
    console.error("Missing required fields:", { to, subject, text });
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const info = await transporter.sendMail({
      from: `"LuxeStay" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html: text,
    });
    console.log("Email sent:", info.messageId);
    res.status(200).json({ message: "Email sent", messageId: info.messageId });
  } catch (error) {
    console.error("Email sending error:", error);
    res.status(500).json({ error: "Failed to send email", details: error });
  }
}
