/**
 * POST /api/sync/social
 * Syncs TikTok/Instagram metrics for a creator.
 * Called manually or by a daily cron job (e.g. Vercel Cron, GitHub Actions).
 *
 * Body: { creatorId?: string }  — if omitted, syncs ALL creators
 *
 * Cron job example (Vercel cron in vercel.json):
 * { "crons": [{ "path": "/api/sync/social", "schedule": "0 3 * * *" }] }
 */

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  // Simple secret token guard for cron calls
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET ?? process.env.NEXTAUTH_SECRET;
  if (authHeader !== `Bearer ${cronSecret}`) {
    return err("Non autorisé", 401);
  }

  let body: { creatorId?: string } = {};
  try { body = await req.json(); } catch { /* no body */ }

  const where = body.creatorId ? { userId: body.creatorId } : {};

  const profiles = await prisma.creatorProfile.findMany({
    where,
    include: { user: { include: { accounts: true } } },
  });

  const results: { userId: string; provider: string; updated: boolean }[] = [];

  for (const profile of profiles) {
    const accounts = profile.user.accounts;

    for (const account of accounts) {
      if (!account.access_token) continue;

      if (account.provider === "tiktok") {
        const data = await fetchTikTokMetrics(account.access_token);
        if (data) {
          await prisma.creatorProfile.update({
            where: { userId: profile.userId },
            data: {
              followersCount: data.followerCount ?? profile.followersCount,
              tiktokHandle:   data.displayName   ?? profile.tiktokHandle,
              bio:            data.bio            ?? profile.bio,
            },
          });
          results.push({ userId: profile.userId, provider: "tiktok", updated: true });
        }
      }

      if (account.provider === "instagram") {
        const data = await fetchInstagramMetrics(account.access_token);
        if (data) {
          await prisma.creatorProfile.update({
            where: { userId: profile.userId },
            data: {
              followersCount:  data.followersCount  ?? profile.followersCount,
              instagramHandle: data.username        ?? profile.instagramHandle,
              bio:             data.biography       ?? profile.bio,
            },
          });
          results.push({ userId: profile.userId, provider: "instagram", updated: true });
        }
      }
    }
  }

  return ok({
    synced: results.length,
    results,
    timestamp: new Date().toISOString(),
  });
}

// ── TikTok API ────────────────────────────────────────────────────────────────

async function fetchTikTokMetrics(accessToken: string) {
  try {
    const res = await fetch(
      "https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name,follower_count,bio_description",
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (!res.ok) return null;
    const json = await res.json();
    const user = json.data?.user;
    if (!user) return null;
    return {
      followerCount: user.follower_count as number,
      displayName:   user.display_name   as string,
      bio:           user.bio_description as string,
    };
  } catch {
    return null;
  }
}

// ── Instagram API ─────────────────────────────────────────────────────────────

async function fetchInstagramMetrics(accessToken: string) {
  try {
    const res = await fetch(
      `https://graph.instagram.com/me?fields=id,username,biography,followers_count&access_token=${accessToken}`
    );
    if (!res.ok) return null;
    const json = await res.json();
    return {
      followersCount: json.followers_count as number,
      username:       json.username        as string,
      biography:      json.biography       as string,
    };
  } catch {
    return null;
  }
}
