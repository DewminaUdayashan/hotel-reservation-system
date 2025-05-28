import { NextApiRequest } from "next";
import { JWT_SECRET } from "./env";
import { jwtDecode } from "jwt-decode";
import { NextRequest } from "next/server";
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

export interface DecodedUser {
  id: number;
  email: string;
  role?: string;
  exp?: number;
  [key: string]: any;
}

export function getUserFromToken(token: string): DecodedUser | null {
  try {
    const decoded = jwtDecode<DecodedUser>(token);
    if (!decoded?.id) {
      return null;
    }

    // Optional: validate expiration
    if (decoded.exp && decoded.exp < Date.now() / 1000) {
      console.warn("Token has expired");
      return null; // token expired
    }

    return decoded;
  } catch (err) {
    console.error("Invalid JWT:", err);
    return null;
  }
}

export function getTokenFromNextRequest(req: NextRequest): string | null {
  const headers = req.headers;
  const token = headers.get("authorization")?.split(" ")[1];
  return token || null;
}

export function isAdminNextRequest(req: NextRequest): boolean {
  const token = getTokenFromNextRequest(req);
  if (!token) return false;
  const user = getUserFromToken(token);
  return (
    user?.role === "admin" || user?.role === "clerk" || user?.role === "manager"
  );
}
