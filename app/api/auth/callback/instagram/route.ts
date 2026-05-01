// GET /api/auth/callback/instagram
// This specific route takes precedence over the NextAuth [...nextauth] catch-all,
// so we handle the Instagram OAuth callback entirely ourselves — no NextAuth state
// check, no JWT parsing issues from the proxy stripping cookies.
//
// Flow:
//  1. Verify CSRF state cookie
//  2. Exchange authorization code for access token
//  3. Fetch Instagram user profile
//  4. Upsert User + CreatorProfile in DB
//  5. Encode a NextAuth-compatible JWT and set the session cookie
//  6. Redirect to /dashboard/creator

import { NextRequest, NextResponse } from "next/server";
import { encode }                    from "next-auth/jwt";
import { prisma }                    from "@/lib/prisma";

// ── Constants ────────────────────────────────────────────────────────────────
const CLIENT_ID     = "26435075029485553";
const CLIENT_SECRET = "3b5b49ac9b4fc326bd7f38c19046dc44";
const REDIRECT_URI  = "https://mafluencer.ma/api/auth/callback/instagram";
const APP_URL       = "https://mafluencer.ma";

// Must be identical to the secret hardcoded in lib/auth.ts and auth.config.ts
// so NextAuth's middleware can verify the JWT we create here.
const SECRET      = "4a8f2c1b9e3d7056af82c14b9f3e7025da8f12c4b9e3067fa82c14b9e307256";
// NextAuth v5 uses this cookie name in production (AUTH_URL starts with https://)
const COOKIE_NAME = "__Secure-authjs.session-token";

// ── Handler ──────────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code  = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const fail = (reason: string) =>
    NextResponse.redirect(`${APP_URL}/auth/signin?error=${encodeURIComponent(reason)}`);

  // ── Instagram returned an error ───────────────────────────────────────────
  if (error) {
    console.error("[Instagram callback] OAuth error:", error, searchParams.get("error_description"));
    return fail(error);
  }

  if (!code) return fail("NoCode");

  // ── CSRF state check ──────────────────────────────────────────────────────
  const savedState = req.cookies.get("ig_state")?.value;
  if (!savedState || savedState !== state) {
    console.warn("[Instagram callback] state mismatch — savedState:", savedState, "| received:", state);
    return fail("StateMismatch");
  }

  try {
    // ── 1. Exchange code for access token ─────────────────────────────────
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
    console.log("[Instagram callback] token response:", JSON.stringify(tokenData));

    if (!tokenRes.ok || tokenData.error_type || tokenData.error) {
      const msg = tokenData.error_message ?? tokenData.error?.message ?? "TokenFailed";
      return fail(msg);
    }

    const accessToken = tokenData.access_token as string;
    const igUserId    = String(tokenData.user_id);

    // ── 2. Fetch Instagram user profile ───────────────────────────────────
    const fields  = "id,username,profile_picture_url,followers_count,media_count,account_type";
    const userRes = await fetch(
      `https://graph.instagram.com/v22.0/${igUserId}?fields=${fields}&access_token=${accessToken}`
    );
    const userData = await userRes.json();
    console.log("[Instagram callback] user data:", JSON.stringify(userData));

    if (!userRes.ok || userData.error) {
      return fail(userData.error?.message ?? "ProfileFailed");
    }

    const igId    = String(userData.id ?? igUserId);
    const email   = `${igId}@instagram.mafluencer.ma`;
    const name    = (userData.username as string) ?? igId;
    const image   = (userData.profile_picture_url as string) ?? null;
    const followers = (userData.followers_count as number) ?? 0;

    // ── 3. Upsert User ────────────────────────────────────────────────────
    let user = await prisma.user.findFirst({
      where:  { email },
      select: { id: true, email: true, name: true, image: true, role: true },
    });

    if (!user) {
      user = await prisma.user.create({
        data:   { email, name, image, role: "CREATOR" },
        select: { id: true, email: true, name: true, image: true, role: true },
      });
    } else if (!user.name || !user.image) {
      user = await prisma.user.update({
        where:  { id: user.id },
        data:   { name: user.name ?? name, image: user.image ?? image },
        select: { id: true, email: true, name: true, image: true, role: true },
      });
    }

    // ── 4. Upsert CreatorProfile ──────────────────────────────────────────
    const existing = await prisma.creatorProfile.findUnique({ where: { userId: user.id } });
    if (existing) {
      await prisma.creatorProfile.update({
        where: { userId: user.id },
        data:  {
          instagramHandle: name  || existing.instagramHandle,
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

    // ── 5. Create NextAuth-compatible JWT ─────────────────────────────────
    // salt must match what NextAuth uses when it decodes the cookie:
    //   packages/core/src/lib/actions/session.ts → salt = cookies.sessionToken.name
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
      maxAge:  30 * 24 * 60 * 60, // 30 days
      salt:    COOKIE_NAME,
    });

    // ── 6. Set cookie + redirect ──────────────────────────────────────────
    const response = NextResponse.redirect(`${APP_URL}/dashboard/creator`);

    response.cookies.set(COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure:   true,
      sameSite: "lax",
      maxAge:   30 * 24 * 60 * 60,
      path:     "/",
    });

    // Clear the CSRF state cookie
    response.cookies.delete("ig_state");

    return response;

  } catch (err) {
    console.error("[Instagram callback] unexpected error:", err);
    return fail("CallbackError");
  }
}
