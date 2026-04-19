import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Passes the request pathname to Server Components (`x-pathname`) so guards can
 * send guests back to the same URL after login. Next.js may migrate this pattern
 * to `proxy` in a future major; the header contract stays the same.
 */
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  response.headers.set("x-pathname", request.nextUrl.pathname);
  return response;
}

export const config = {
  matcher: ["/app", "/app/:path*", "/welcome", "/welcome/:path*", "/internal", "/internal/:path*"],
};
