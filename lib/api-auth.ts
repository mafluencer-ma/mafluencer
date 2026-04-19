import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { ratelimit, authRatelimit } from "@/lib/redis";

export type AuthUser = {
  id: string;
  email: string;
  name?: string | null;
  role: string;
};

// ── Auth helpers ──────────────────────────────────────────────────────────────

export async function requireAuth(): Promise<
  { user: AuthUser; error: null } | { user: null; error: NextResponse }
> {
  const session = await auth();
  if (!session?.user?.email) {
    return { user: null, error: NextResponse.json({ error: "Non authentifié" }, { status: 401 }) };
  }
  const user = session.user as AuthUser;
  return { user, error: null };
}

export async function requireRole(
  role: "ADMIN" | "MANAGER" | "BRAND" | "CREATOR"
): Promise<{ user: AuthUser; error: null } | { user: null; error: NextResponse }> {
  const result = await requireAuth();
  if (result.error) return result;
  if (result.user.role !== role) {
    return {
      user: null,
      error: NextResponse.json({ error: "Accès refusé" }, { status: 403 }),
    };
  }
  return result;
}

// ADMIN and MANAGER both have full admin access
export async function requireAdmin(): Promise<
  { user: AuthUser; error: null } | { user: null; error: NextResponse }
> {
  const result = await requireAuth();
  if (result.error) return result;
  if (result.user.role !== "ADMIN" && result.user.role !== "MANAGER") {
    return {
      user: null,
      error: NextResponse.json({ error: "Accès refusé — admin requis" }, { status: 403 }),
    };
  }
  return result;
}

// ── Rate limiting helper ──────────────────────────────────────────────────────

export async function withRateLimit(
  req: NextRequest,
  type: "default" | "auth" = "default"
): Promise<NextResponse | null> {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
      req.headers.get("x-real-ip") ??
      "anonymous";

    const limiter = type === "auth" ? authRatelimit : ratelimit;
    const { success, limit, remaining, reset } = await limiter.limit(ip);

    if (!success) {
      return NextResponse.json(
        { error: "Trop de requêtes, réessaie dans quelques secondes." },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": String(limit),
            "X-RateLimit-Remaining": String(remaining),
            "X-RateLimit-Reset": String(reset),
            "Retry-After": String(Math.ceil((reset - Date.now()) / 1000)),
          },
        }
      );
    }
    return null;
  } catch {
    // If Redis is unavailable, don't block the request
    return null;
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

export function ok<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function err(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}
