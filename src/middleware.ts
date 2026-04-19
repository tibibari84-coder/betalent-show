import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Lets server layouts send users back to the exact protected URL after login.
 */
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  response.headers.set("x-pathname", request.nextUrl.pathname);
  return response;
}

export const config = {
  matcher: ["/app", "/app/:path*", "/welcome", "/welcome/:path*", "/internal", "/internal/:path*"],
};
