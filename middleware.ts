import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = await getToken({
    req:    request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // ── /dashboard (bare) → redirect to role-specific dashboard ──────────────
  if (pathname === "/dashboard" || pathname === "/dashboard/") {
    if (!token) {
      return NextResponse.redirect(new URL("/auth/signin", request.url));
    }
    const role = (token.role as string) ?? "CREATOR";
    const dest = role === "BRAND" ? "/dashboard/brand"
               : role === "ADMIN" ? "/dashboard/admin"
               : "/dashboard/creator";
    return NextResponse.redirect(new URL(dest, request.url));
  }

  // ── Protected dashboard routes — require authentication ───────────────────
  if (pathname.startsWith("/dashboard")) {
    if (!token) {
      const signInUrl = new URL("/auth/signin", request.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*"],
};
