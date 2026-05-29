// GET /api/auth/callback/tiktok
// Supports two modes:
//  - Login (no active session): creates/finds user, sets JWT cookie, → /dashboard/creator
//  - Connect (active session):  links TikTok to existing user → /auth/social-callback

import { NextRequest, NextResponse } from "next/server";
import { encode, decode }            from "next-auth/jwt";
import { prisma }                    from "@/lib/prisma";

const COOKIE_NAME = "__Secure-authjs.session-token";

export async function GET(req: NextRequest) {
  const BASE_URL    = process.env.BASE_URL    ?? "https://medinamaroc.com";
  const CLIENT_KEY  = process.env.TIKTOK_CLIENT_KEY!;
  const CLIENT_SEC  = process.env.TIKTOK_CLIENT_SECRET!;
  const SECRET      = process.env.NEXTAUTH_SECRET!;
  const REDIRECT_URI = `${BASE_URL}/api/auth/callback/tiktok`;

  const { searchParams } = new URL(req.url);
  const code  = searchParams.get("code");
  const error = searchParams.get("error");

  const fail = (reason: string) =>
    NextResponse.redirect(`${BASE_URL}/auth/signin?error=${encodeURIComponent(reason)}`);

  if (error) return fail(error);
  if (!code) return fail("NoCode");

  try {
    // ── 1. Exchange code for access token ─────────────────────────────────
    const tokenRes = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
      method:  "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_key:    CLIENT_KEY,
        client_secret: CLIENT_SEC,
        code,
        grant_type:    "authorization_code",
        redirect_uri:  REDIRECT_URI,
      }),
    });
    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || tokenData.error) {
      return fail(tokenData.error_description ?? "TokenFailed");
    }

    const accessToken = tokenData.access_token as string;
    const openId      = tokenData.open_id      as string;

    // ── 2. Fetch TikTok user profile ──────────────────────────────────────
    const userRes = await fetch(
      "https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name,avatar_url,follower_count,bio_description",
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const userPayload = await userRes.json();

    const userData  = (userPayload?.data?.user ?? {}) as Record<string, unknown>;
    const ttOpenId  = (userData.open_id       as string) ?? openId;
    const name      = (userData.display_name  as string) ?? ttOpenId;
    const image     = (userData.avatar_url    as string) ?? null;
    const followers = (userData.follower_count as number) ?? 0;
    const bio       = (userData.bio_description as string) ?? "";
    const email     = `${ttOpenId}@tiktok.mafluencer.ma`;

    // ── 3. Detect mode: connect vs login ──────────────────────────────────
    const rawCookie   = req.cookies.get(COOKIE_NAME)?.value;
    const existingJwt = rawCookie
      ? await decode({ token: rawCookie, secret: SECRET, salt: COOKIE_NAME }).catch(() => null)
      : null;
    const currentUserId = existingJwt?.id as string | undefined ?? existingJwt?.sub as string | undefined;
    const isConnect = Boolean(currentUserId);

    let user: { id: string; email: string; name: string | null; image: string | null; role: string };

    if (isConnect) {
      // ── Connect mode: link TikTok to already-logged-in user ──────────────
      const dbUser = await prisma.user.findUnique({
        where:  { id: currentUserId },
        select: { id: true, email: true, name: true, image: true, role: true },
      });
      if (!dbUser) return fail("UserNotFound");
      user = dbUser;
    } else {
      // ── Login mode: find or create by TikTok email ───────────────────────
      let found = await prisma.user.findUnique({ where: { email },
        select: { id: true, email: true, name: true, image: true, role: true },
      });
      if (!found) {
        found = await prisma.user.create({
          data:   { email, name, image, role: "CREATOR" },
          select: { id: true, email: true, name: true, image: true, role: true },
        });
      } else if (!found.name || !found.image) {
        found = await prisma.user.update({
          where:  { id: found.id },
          data:   { name: found.name ?? name, image: found.image ?? image },
          select: { id: true, email: true, name: true, image: true, role: true },
        });
      }
      user = found;
    }

    // ── 4. Upsert CreatorProfile ──────────────────────────────────────────
    const existingProfile = await prisma.creatorProfile.findUnique({ where: { userId: user.id } });
    if (existingProfile) {
      await prisma.creatorProfile.update({
        where: { userId: user.id },
        data: {
          tiktokHandle:   name      || existingProfile.tiktokHandle,
          followersCount: followers || existingProfile.followersCount,
          bio:            bio       || existingProfile.bio,
          verified:       true,
        },
      });
    } else {
      await prisma.creatorProfile.create({
        data: {
          userId:         user.id,
          tiktokHandle:   name,
          followersCount: followers,
          bio,
          niches:         [],
          score:          0,
          level:          "Rookie",
          verified:       true,
        },
      });
    }

    // ── 4b. Store access token for metrics tracking ──────────────────────
    try {
      await prisma.socialToken.upsert({
        where:  { userId_platform: { userId: user.id, platform: "tiktok" } },
        create: {
          userId:         user.id,
          platform:       "tiktok",
          accessToken:    accessToken,
          platformUserId: ttOpenId,
          username:       name,
        },
        update: {
          accessToken:    accessToken,
          platformUserId: ttOpenId,
          username:       name,
        },
      });
    } catch { /* non-fatal */ }

    if (isConnect) {
      // Connect mode: existing cookie is valid — close the popup
      return NextResponse.redirect(`${BASE_URL}/auth/social-callback`);
    }

    // ── 5. Login mode: create NextAuth JWT + set cookie ───────────────────
    const sessionToken = await encode({
      token: {
        sub:     user.id,
        id:      user.id,
        email:   user.email,
        name:    user.name ?? name,
        picture: user.image ?? image,
        role:    user.role,
      },
      secret: SECRET,
      maxAge: 30 * 24 * 60 * 60,
      salt:   COOKIE_NAME,
    });

    const response = NextResponse.redirect(`${BASE_URL}/dashboard/creator`);
    response.cookies.set(COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure:   true,
      sameSite: "lax",
      maxAge:   30 * 24 * 60 * 60,
      path:     "/",
    });

    return response;

  } catch (err) {
    console.error("[TikTok callback] unexpected error:", err);
    return fail("CallbackError");
  }
}
