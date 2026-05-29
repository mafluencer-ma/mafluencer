// GET /api/auth/instagram/login
// Redirects to Instagram's OAuth authorization page.
// State is stored in Redis (not a cookie) — cookie-based state is unreliable
// behind Hostinger's reverse proxy, which strips Set-Cookie from redirect responses.

import { NextResponse } from "next/server";
import { redis }        from "@/lib/redis";
import logger           from "@/lib/logger";

export async function GET() {
  const BASE_URL     = process.env.BASE_URL ?? "https://medinamaroc.com";
  const CLIENT_ID    = process.env.INSTAGRAM_CLIENT_ID!;
  const REDIRECT_URI = process.env.INSTAGRAM_REDIRECT_URI ?? `${BASE_URL}/api/auth/callback/instagram`;
  const state        = crypto.randomUUID();

  // Store state in Redis with 10-minute TTL — callback will verify + delete it
  await redis.set(`ig_state:${state}`, "1", "EX", 600);

  logger.info("[Instagram login] state stored in Redis", { state: state.slice(0, 8) + "…" });

  const params = new URLSearchParams({
    force_reauth:  "true",
    client_id:     CLIENT_ID,
    redirect_uri:  REDIRECT_URI,
    response_type: "code",
    scope:         "instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments,instagram_business_content_publish,instagram_business_manage_insights",
    state,
  });

  return NextResponse.redirect(
    `https://www.instagram.com/oauth/authorize?${params.toString()}`
  );
}
