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

  console.log("[MIDDLEWARE]", { pathname, role, isAuth: isAuthed });

  // ── /dashboard (bare) → route by role ──────────────────────────────────────
  if (pathname === "/dashboard" || pathname === "/dashboard/") {
    if (!isAuthed) {
      return Response.redirect(new URL("/auth/signin?callbackUrl=%2Fdashboard", req.url));
    }
    const dest =
      role === "ADMIN" ? "/dashboard/admin" :
      role === "BRAND" ? "/dashboard/brand" :
      "/dashboard/creator";
    return Response.redirect(new URL(dest, req.url));
  }

  // ── /dashboard/* → require auth ────────────────────────────────────────────
  if (pathname.startsWith("/dashboard/") && !isAuthed) {
    const signInUrl = new URL("/auth/signin", req.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return Response.redirect(signInUrl);
  }

  // ── /dashboard/admin/* → require ADMIN role ─────────────────────────────────
  if (pathname.startsWith("/dashboard/admin") && role !== "ADMIN") {
    const dest = role === "BRAND" ? "/dashboard/brand" : "/dashboard/creator";
    return Response.redirect(new URL(dest, req.url));
  }

  // ── /auth/signin → skip if already authenticated ────────────────────────────
  if (pathname === "/auth/signin" && isAuthed) {
    const dest =
      role === "ADMIN" ? "/dashboard/admin" :
      role === "BRAND" ? "/dashboard/brand" :
      "/dashboard/creator";
    return Response.redirect(new URL(dest, req.url));
  }
});

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon\\.ico|logo\\.png|fav\\.png).*)" ],
};
