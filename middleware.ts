import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// NOTE: Do NOT import from @/lib/auth or @/lib/prisma here.
// Middleware runs in the Edge runtime. lib/prisma.ts uses `pg` (node-postgres)
// which is Node.js-only and crashes on Edge with empty {} error objects.
// getToken() only reads the JWT cookie using the NEXTAUTH_SECRET — no DB call.

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  let token: { id?: string; role?: string } | null = null;
  try {
    token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });
  } catch (e) {
    console.error("[middleware] getToken error:", e);
  }

  const isAuthed = Boolean(token);
  const role     = token?.role ?? null;

  console.log("[MIDDLEWARE]", { pathname, role, isAuth: isAuthed });

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

  // ── All /dashboard/* → require auth ────────────────────────────────────────
  if (pathname.startsWith("/dashboard/") && !isAuthed) {
    const signInUrl = new URL("/auth/signin", req.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // ── /dashboard/admin/* → require ADMIN role ─────────────────────────────────
  if (pathname.startsWith("/dashboard/admin") && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard/creator", req.url));
  }

  // ── Already authenticated → skip signin page only ───────────────────────────
  // /auth/register is intentionally NOT redirected — an authenticated user may
  // still need to visit it to complete role selection after a magic link login.
  if (pathname === "/auth/signin" && isAuthed) {
    const dest =
      role === "ADMIN" ? "/dashboard/admin" :
      role === "BRAND" ? "/dashboard/brand" :
      "/dashboard/creator";
    return NextResponse.redirect(new URL(dest, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Run on all paths except Next.js internals, static files, and auth API
    "/((?!api/auth|_next/static|_next/image|favicon\\.ico|logo\\.png|fav\\.png).*)",
  ],
};
