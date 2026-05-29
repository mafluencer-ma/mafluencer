// GET /api/auth/callback/instagram
// Handles the Instagram Business Login OAuth callback.
// Supports two modes:
//  - Login (no active session): creates/finds user, sets JWT cookie, → /dashboard/creator
//  - Connect (active session):  links Instagram to existing user → /auth/social-callback

import { NextRequest, NextResponse } from "next/server";
import { encode, decode }            from "next-auth/jwt";
import { prisma }                    from "@/lib/prisma";
import { redis }                     from "@/lib/redis";

const COOKIE_NAME = "__Secure-authjs.session-token";

function log(level: "info" | "warn" | "error", message: string, data?: Record<string, unknown>) {
  try {
    // Dynamic import so a logger crash never causes a 500
    import("@/lib/logger").then(({ default: logger }) => {
      logger[level](message, data ?? {});
    }).catch(() => {});
  } catch { /* never block auth on logging failures */ }
  // Always mirror to console so Hostinger/Docker logs capture it too
  console[level === "info" ? "log" : level](`[Instagram] ${message}`, data ?? "");
}

// ── Handler ──────────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const BASE_URL      = process.env.BASE_URL ?? "https://medinamaroc.com";
  const CLIENT_ID     = process.env.INSTAGRAM_CLIENT_ID!;
  const CLIENT_SECRET = process.env.INSTAGRAM_CLIENT_SECRET!;
  const SECRET        = process.env.NEXTAUTH_SECRET!;
  const REDIRECT_URI  = process.env.INSTAGRAM_REDIRECT_URI ?? `${BASE_URL}/api/auth/callback/instagram`;

  const { searchParams } = new URL(req.url);
  const code  = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const fail = (reason: string) => {
    log("error", "auth failed", { reason });
    return NextResponse.redirect(`${BASE_URL}/auth/signin?error=${encodeURIComponent(reason)}`);
  };

  if (error) {
    log("error", "OAuth error from Instagram", { error, description: searchParams.get("error_description") });
    return fail(error);
  }

  if (!code)  return fail("NoCode");
  if (!state) return fail("StateMissing");

  try {
    // ── 1. Verify CSRF state via Redis ────────────────────────────────────
    // DEL returns 1 if the key existed (valid state), 0 if not found/expired.
    // If the proxy retries the request, the state is already gone — check for
    // the short-lived "done" marker we set after a successful first run.
    let deleted = 0;
    try {
      deleted = await redis.del(`ig_state:${state}`);
    } catch (redisErr) {
      log("error", "Redis del failed — treating as state mismatch", {
        error: redisErr instanceof Error ? redisErr.message : String(redisErr),
      });
      return fail("StateMismatch");
    }

    if (deleted === 0) {
      // Check if this is a proxy retry of an already-completed flow
      try {
        const doneUserId = await redis.get(`ig_done:${state}`);
        if (doneUserId) {
          log("info", "proxy retry detected — redirecting to dashboard", { state: state.slice(0, 8) + "…" });
          return NextResponse.redirect(`${BASE_URL}/dashboard/creator`);
        }
      } catch { /* ignore — fall through to StateMismatch */ }

      log("warn", "state not found in Redis — expired or replayed", { state: state.slice(0, 8) + "…" });
      return fail("StateMismatch");
    }

    log("info", "state verified", { state: state.slice(0, 8) + "…" });

    // ── 2. Exchange code for access token ─────────────────────────────────
    log("info", "exchanging code for token");
    const tokenRes = await fetch("https://api.instagram.com/oauth/access_token", {
      method:  "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id:     CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type:    "authorization_code",
        redirect_uri:  REDIRECT_URI,
        code,
      }),
    });
    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || tokenData.error_type || tokenData.error) {
      const msg = tokenData.error_message ?? tokenData.error?.message ?? "TokenFailed";
      log("error", "token exchange failed", { status: tokenRes.status, error: msg, body: JSON.stringify(tokenData) });
      return fail(msg);
    }

    const accessToken = tokenData.access_token as string;
    log("info", "token exchange successful");

    // ── 3. Fetch Instagram user profile ───────────────────────────────────
    const fields  = "id,username,name,profile_picture_url,followers_count,media_count,account_type,biography";
    const userRes = await fetch(
      `https://graph.instagram.com/v22.0/me?fields=${fields}&access_token=${accessToken}`
    );
    const userData = await userRes.json();

    if (!userRes.ok || userData.error) {
      log("error", "profile fetch failed", { status: userRes.status, error: JSON.stringify(userData.error) });
      return fail(userData.error?.message ?? "ProfileFailed");
    }

    const igId      = String(userData.id ?? tokenData.user_id ?? "unknown");
    const email     = `${igId}@instagram.mafluencer.ma`;
    const name      = (userData.username as string) ?? igId;
    const image     = (userData.profile_picture_url as string) ?? null;
    const followers = (userData.followers_count as number) ?? 0;

    log("info", "profile fetched", { igId, username: name, followers });

    // ── 4. Detect mode: connect (existing session) vs login (new) ────────
    const rawCookie   = req.cookies.get(COOKIE_NAME)?.value;
    const existingJwt = rawCookie
      ? await decode({ token: rawCookie, secret: SECRET, salt: COOKIE_NAME }).catch(() => null)
      : null;
    const currentUserId = existingJwt?.id as string | undefined ?? existingJwt?.sub as string | undefined;
    const isConnect = Boolean(currentUserId);

    let user: { id: string; email: string; name: string | null; image: string | null; role: string };

    if (isConnect) {
      // ── Connect mode: link Instagram to the already-logged-in user ────────
      const dbUser = await prisma.user.findUnique({
        where:  { id: currentUserId },
        select: { id: true, email: true, name: true, image: true, role: true },
      });
      if (!dbUser) return fail("UserNotFound");
      user = dbUser;
      log("info", "connect mode — linking Instagram to existing user", { userId: user.id });
    } else {
      // ── Login mode: find or create user by Instagram email ────────────────
      let found = await prisma.user.findFirst({
        where:  { email },
        select: { id: true, email: true, name: true, image: true, role: true },
      });
      if (!found) {
        found = await prisma.user.create({
          data:   { email, name, image, role: "CREATOR" },
          select: { id: true, email: true, name: true, image: true, role: true },
        });
        log("info", "new user created", { userId: found.id });
      } else {
        if (!found.name || !found.image) {
          found = await prisma.user.update({
            where:  { id: found.id },
            data:   { name: found.name ?? name, image: found.image ?? image },
            select: { id: true, email: true, name: true, image: true, role: true },
          });
        }
        log("info", "existing user", { userId: found.id });
      }
      user = found;
    }

    // ── 5. Upsert CreatorProfile ──────────────────────────────────────────
    const existing = await prisma.creatorProfile.findUnique({ where: { userId: user.id } });
    if (existing) {
      await prisma.creatorProfile.update({
        where: { userId: user.id },
        data:  {
          instagramHandle: name      || existing.instagramHandle,
          followersCount:  followers || existing.followersCount,
          verified:        true,
        },
      });
    } else {
      await prisma.creatorProfile.create({
        data: {
          userId:          user.id,
          instagramHandle: name,
          followersCount:  followers,
          niches:          [],
          score:           0,
          level:           "Rookie",
          verified:        true,
        },
      });
    }
    log("info", "creator profile upserted", { userId: user.id });

    // ── 5b. Store access token for metrics tracking ───────────────────────
    try {
      await prisma.socialToken.upsert({
        where:  { userId_platform: { userId: user.id, platform: "instagram" } },
        create: {
          userId:         user.id,
          platform:       "instagram",
          accessToken:    accessToken,
          platformUserId: igId,
          username:       name,
        },
        update: {
          accessToken:    accessToken,
          platformUserId: igId,
          username:       name,
        },
      });
      log("info", "social token stored", { userId: user.id, platform: "instagram" });
    } catch (tokenErr) {
      log("warn", "failed to store social token (non-fatal)", {
        error: tokenErr instanceof Error ? tokenErr.message : String(tokenErr),
      });
    }

    // Mark this state as completed so proxy retries redirect gracefully (90s TTL)
    try { await redis.set(`ig_done:${state}`, user.id, "EX", 90); } catch { /* non-fatal */ }

    if (isConnect) {
      // Connect mode: session cookie is already valid — just redirect the popup to close
      log("info", "connect complete, closing popup", { userId: user.id });
      return NextResponse.redirect(`${BASE_URL}/auth/social-callback`);
    }

    // ── 6. Login mode: create NextAuth JWT + set cookie ───────────────────
    const sessionToken = await encode({
      token: {
        sub:     user.id,
        id:      user.id,
        email:   user.email,
        name:    user.name ?? name,
        picture: user.image ?? image,
        role:    user.role,
      },
      secret:  SECRET,
      maxAge:  30 * 24 * 60 * 60,
      salt:    COOKIE_NAME,
    });

    const response = NextResponse.redirect(`${BASE_URL}/dashboard/creator`);
    response.cookies.set(COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure:   true,
      sameSite: "lax",
      maxAge:   30 * 24 * 60 * 60,
      path:     "/",
    });

    log("info", "login complete, redirecting to dashboard", { userId: user.id });
    return response;

  } catch (err) {
    log("error", "unexpected error in callback", {
      error: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    });
    return fail("CallbackError");
  }
}
