// middleware.ts — runs in Edge runtime
// Uses NextAuth(authConfig).auth which reads the v5 JWT cookie correctly.
// Does NOT import lib/auth.ts or lib/prisma.ts (both use pg which is Node-only).

import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import type { NextRequest } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth(function middleware(
  req: NextRequest & { auth?: { user?: { id?: string; role?: string } } | null }
) {
  const { pathname } = req.nextUrl;
  const session      = req.auth;
  const isAuthed     = Boolean(session?.user);
  const role         = session?.user?.role ?? null;
  const isAdmin      = role === "ADMIN" || role === "MANAGER";

  // ── /dashboard (bare) → route by role ──────────────────────────────────────
  if (pathname === "/dashboard" || pathname === "/dashboard/") {
    if (!isAuthed) {
      return Response.redirect(new URL("/auth/signin?callbackUrl=%2Fdashboard", req.url));
    }
    const dest =
      isAdmin            ? "/dashboard/admin" :
      role === "BRAND"   ? "/dashboard/brand" :
      "/dashboard/creator";
    return Response.redirect(new URL(dest, req.url));
  }

  // ── /dashboard/* → require auth ────────────────────────────────────────────
  if (pathname.startsWith("/dashboard/") && !isAuthed) {
    const signInUrl = new URL("/auth/signin", req.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return Response.redirect(signInUrl);
  }

  // ── /dashboard/admin/* → ADMIN or MANAGER only ──────────────────────────────
  if (pathname.startsWith("/dashboard/admin") && !isAdmin) {
    const dest = role === "BRAND" ? "/dashboard/brand" : "/dashboard/creator";
    return Response.redirect(new URL(dest, req.url));
  }

  // ── /dashboard/brand/* → BRAND, ADMIN or MANAGER only ──────────────────────
  // Guard only when role is known — avoids infinite loop while JWT is being populated
  if (pathname.startsWith("/dashboard/brand") && role && role !== "BRAND" && !isAdmin) {
    return Response.redirect(new URL("/dashboard/creator", req.url));
  }

  // ── /dashboard/creator/* → CREATOR, ADMIN or MANAGER only ──────────────────
  // Guard only when role is known — avoids infinite loop while JWT is being populated
  if (pathname.startsWith("/dashboard/creator") && role && role !== "CREATOR" && !isAdmin) {
    return Response.redirect(new URL("/dashboard/brand", req.url));
  }

  // ── auth pages → redirect to dashboard if already authenticated ───────────────
  const authOnlyPaths = ["/auth/signin", "/auth/register", "/auth/complete", "/auth/social-popup"];
  if (authOnlyPaths.some(p => pathname === p || pathname.startsWith(p + "/")) && isAuthed) {
    const dest =
      isAdmin            ? "/dashboard/admin" :
      role === "BRAND"   ? "/dashboard/brand" :
      "/dashboard/creator";
    return Response.redirect(new URL(dest, req.url));
  }
});

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon\\.ico|logo\\.png|fav\\.png).*)" ],
};
