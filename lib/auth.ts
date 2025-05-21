import { NextApiRequest } from "next";
import { JWT_SECRET } from "./env";
var jwt = require("jsonwebtoken");

export function verifyToken(req: NextApiRequest) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.replace("Bearer ", "");

  if (!token) throw new Error("No token provided");

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded as { id: number; email: string; role: string };
  } catch (err) {
    throw new Error("Invalid token");
  }
}
