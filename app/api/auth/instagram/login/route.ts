// GET /api/auth/instagram/login
// Builds the Instagram OAuth URL and redirects the browser there.
// Stores a CSRF state value in a short-lived cookie so the callback
// can verify the redirect is genuine.

import { NextResponse } from "next/server";

const CLIENT_ID   = "26435075029485553";
const REDIRECT_URI = "https://mafluencer.ma/api/auth/callback/instagram";
const SCOPE        = [
  "instagram_business_basic",
  "instagram_business_manage_messages",
  "instagram_business_manage_comments",
  "instagram_business_content_publish",
  "instagram_business_manage_insights",
].join(",");

export async function GET() {
  const state = crypto.randomUUID();

  const params = new URLSearchParams({
    force_reauth:  "true",
    client_id:     CLIENT_ID,
    redirect_uri:  REDIRECT_URI,
    response_type: "code",
    scope:         SCOPE,
    state,
  });

  const response = NextResponse.redirect(
    `https://www.instagram.com/oauth/authorize?${params.toString()}`
  );

  // Store state for CSRF verification in the callback.
  // SameSite=Lax is enough — top-level GET redirects (like OAuth callbacks) carry Lax cookies.
  response.cookies.set("ig_state", state, {
    httpOnly: true,
    secure:   true,
    sameSite: "lax",
    maxAge:   60 * 10, // 10 minutes
    path:     "/",
  });

  return response;
}
