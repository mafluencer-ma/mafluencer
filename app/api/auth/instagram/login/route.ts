// GET /api/auth/instagram/login
// Redirects directly to Instagram's OAuth authorization page using the
// exact URL provided for this app. Appends a CSRF state param and stores
// it in a short-lived cookie so the callback can verify the redirect.

import { NextResponse } from "next/server";

// Base URL as provided — state is appended dynamically for CSRF protection.
const INSTAGRAM_AUTH_BASE =
  "https://www.instagram.com/oauth/authorize" +
  "?force_reauth=true" +
  "&client_id=26435075029485553" +
  "&redirect_uri=https://mafluencer.ma/api/auth/callback/instagram" +
  "&response_type=code" +
  "&scope=instagram_business_basic%2Cinstagram_business_manage_messages%2Cinstagram_business_manage_comments%2Cinstagram_business_content_publish%2Cinstagram_business_manage_insights";

export async function GET() {
  const state = crypto.randomUUID();

  const response = NextResponse.redirect(
    `${INSTAGRAM_AUTH_BASE}&state=${state}`
  );

  // SameSite=Lax is sufficient — top-level GET redirects (OAuth callbacks)
  // carry Lax cookies back to the same site.
  response.cookies.set("ig_state", state, {
    httpOnly: true,
    secure:   true,
    sameSite: "lax",
    maxAge:   60 * 10, // 10 minutes
    path:     "/",
  });

  return response;
}
