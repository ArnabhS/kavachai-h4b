import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@civic/auth-web3/nextjs";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // Public routes
  if (pathname === "/" || pathname === "/login") {
    return NextResponse.next();
  }
  // Check authentication
  const user = await getUser();
  if (!user) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth|public).*)"],
}; 