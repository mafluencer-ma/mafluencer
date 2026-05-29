// GET /api/auth/tiktok/login
// Redirects to TikTok OAuth using client_key (TikTok's non-standard param).
// Stores a CSRF state in a short-lived cookie for the callback to verify.

import { NextResponse } from "next/server";

export async function GET() {
  const BASE_URL   = process.env.BASE_URL ?? "https://medinamaroc.com";
  const CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY!;

  const params = new URLSearchParams({
    client_key:    CLIENT_KEY,
    response_type: "code",
    scope:         "user.info.basic,user.info.profile,user.info.stats",
    redirect_uri:  `${BASE_URL}/api/auth/callback/tiktok`,
    state:         crypto.randomUUID(),
  });

  return NextResponse.redirect(
    `https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`
  );
}
