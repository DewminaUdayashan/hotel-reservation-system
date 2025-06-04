import { NextRequest, NextResponse } from "next/server";
import { isAdminNextRequest } from "./lib/auth";

const CRON_SECRET = process.env.INTERNAL_CRON_SECRET;

// Limit the middleware to paths starting with `/api/`
export const config = {
  matcher: "/api/admin/:path*",
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // Check if the request is for the admin API
  if (!pathname.startsWith("/api/admin")) {
    // If not, skip the middleware
    return;
  }

  // Allow internal requests with the correct secret
  const cronSecret = request.headers.get("Authorization");
  if (cronSecret && cronSecret === CRON_SECRET) {
    return NextResponse.next();
  }

  const isAdminRequest = isAdminNextRequest(request);
  if (!isAdminRequest)
    // Forbidden: user is not an admin
    return Response.json(
      { success: false, message: "Forbidden!" },
      { status: 403 }
    );

  return NextResponse.next();
}
