import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((request) => {
  const { pathname } = request.nextUrl;
  const session = request.auth;

  // ── /dashboard (bare) → route by role ──────────────────────────────────────
  if (pathname === "/dashboard" || pathname === "/dashboard/") {
    if (!session) {
      return NextResponse.redirect(new URL("/auth/signin", request.url));
    }
    const role = (session.user as { role?: string })?.role ?? "CREATOR";
    const dest =
      role === "BRAND" ? "/dashboard/brand" :
      role === "ADMIN" ? "/dashboard/admin" :
      "/dashboard/creator";
    return NextResponse.redirect(new URL(dest, request.url));
  }

  // ── All /dashboard/* → require auth ────────────────────────────────────────
  if (pathname.startsWith("/dashboard/") && !session) {
    const signInUrl = new URL("/auth/signin", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*"],
};
