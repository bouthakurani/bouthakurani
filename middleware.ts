import { NextRequest, NextResponse } from "next/server";
export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  if (path.startsWith("/admin") && path !== "/admin/login" && !req.cookies.get("bouthakurani_session")) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }
  return NextResponse.next();
}
export const config = { matcher: ["/admin/:path*"] };