import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// NextAuth v5: wrapping with auth() populates req.auth from the JWT cookie
// without any DB call — safe for Edge and Node.js runtimes.
export default auth(function middleware(req: NextRequest & { auth?: { user?: { role?: string } } | null }) {
  const { pathname } = req.nextUrl;
  const session      = req.auth;
  const role         = session?.user?.role ?? null;
  const isAuthed     = Boolean(session?.user);

  // ── /dashboard (bare) → redirect to role-specific sub-path ─────────────────
  if (pathname === "/dashboard" || pathname === "/dashboard/") {
    if (!isAuthed) {
      return NextResponse.redirect(new URL("/auth/signin?callbackUrl=%2Fdashboard", req.url));
    }
    const dest =
      role === "ADMIN" ? "/dashboard/admin" :
      role === "BRAND" ? "/dashboard/brand" :
      "/dashboard/creator";
    return NextResponse.redirect(new URL(dest, req.url));
  }

  // ── All /dashboard/* routes → require authentication ────────────────────────
  if (pathname.startsWith("/dashboard/") && !isAuthed) {
    const signInUrl = new URL("/auth/signin", req.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // ── /dashboard/admin/* → require ADMIN role ─────────────────────────────────
  if (pathname.startsWith("/dashboard/admin") && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard/creator", req.url));
  }

  // ── Already authenticated → skip auth pages ─────────────────────────────────
  if ((pathname.startsWith("/auth/signin") || pathname.startsWith("/auth/register")) && isAuthed) {
    const dest =
      role === "ADMIN" ? "/dashboard/admin" :
      role === "BRAND" ? "/dashboard/brand" :
      "/dashboard/creator";
    return NextResponse.redirect(new URL(dest, req.url));
  }

  return NextResponse.next();
});

export const config = {
  // Run on all paths except Next.js internals, static files, and API auth routes
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|logo.png|fav.png|public).*)",
  ],
};
