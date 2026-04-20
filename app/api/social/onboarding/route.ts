import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, withRateLimit, requireAuth } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

// ── ScrapeCreators helper ────────────────────────────────────────────────────

type ProfileData = {
  followers: number;
  following: number;
  posts:     number;
  nickname?: string;
  avatar?:   string;
  bio?:      string;
};

async function fetchProfile(
  platform: "tiktok" | "instagram",
  handle: string,
  apiKey: string
): Promise<{ data: ProfileData } | { error: string }> {
  try {
    if (platform === "tiktok") {
      const res = await fetch(
        `https://api.scrapecreators.com/v1/tiktok/profile?handle=${encodeURIComponent(handle)}`,
        { headers: { "x-api-key": apiKey }, cache: "no-store" }
      );
      if (!res.ok) return { error: "Compte TikTok introuvable" };
      const data = await res.json();
      const stats = data?.stats ?? data?.userInfo?.stats;
      const info  = data?.user  ?? data?.userInfo?.user ?? data;
      if (!stats && !info?.followerCount) return { error: "Compte TikTok introuvable ou privé" };
      return {
        data: {
          followers: stats?.followerCount  ?? info?.followerCount  ?? 0,
          following: stats?.followingCount ?? info?.followingCount ?? 0,
          posts:     stats?.videoCount     ?? info?.videoCount     ?? 0,
          nickname:  info?.nickname        ?? info?.displayName,
          avatar:    info?.avatarMedium    ?? info?.avatar,
          bio:       info?.signature       ?? info?.bio,
        },
      };
    } else {
      const res = await fetch(
        `https://api.scrapecreators.com/v1/instagram/profile?handle=${encodeURIComponent(handle)}`,
        { headers: { "x-api-key": apiKey }, cache: "no-store" }
      );
      if (!res.ok) return { error: "Compte Instagram introuvable" };
      const data = await res.json();
      const d = data?.user ?? data?.data ?? data;
      if (!d) return { error: "Compte Instagram introuvable ou privé" };
      return {
        data: {
          followers: d.follower_count  ?? d.followers ?? 0,
          following: d.following_count ?? d.following ?? 0,
          posts:     d.media_count     ?? d.posts     ?? 0,
          bio:       d.biography       ?? d.bio,
          avatar:    d.profile_pic_url ?? d.avatar,
          nickname:  d.full_name       ?? d.name,
        },
      };
    }
  } catch {
    return { error: "Impossible de récupérer le profil. Réessaie plus tard." };
  }
}

// ── Actions ──────────────────────────────────────────────────────────────────
//
// POST /api/social/onboarding?action=preview
//   body: { platform, username }
//   → fetch profile from ScrapeCreators, return preview (no DB writes)
//
// POST /api/social/onboarding?action=confirm
//   body: { platform, username }
//   → save handle + followers, set verified=false (pending admin review)
//   → set onboardingCompleted=true
//   → create admin Notification
//
// POST /api/social/onboarding?action=skip
//   → set onboardingCompleted=true, no social linking

export async function POST(req: NextRequest) {
  const limited = await withRateLimit(req);
  if (limited) return limited;

  const { user, error } = await requireAuth();
  if (error) return error;

  const action = req.nextUrl.searchParams.get("action") ?? "preview";

  // ── SKIP ────────────────────────────────────────────────────────────────────
  if (action === "skip") {
    await prisma.creatorProfile.update({
      where: { userId: user.id },
      data:  { onboardingCompleted: true },
    });
    return ok({ skipped: true });
  }

  const body = await req.json() as { platform: "tiktok" | "instagram"; username: string };
  const { platform, username } = body;

  if (!platform || !username?.trim()) return err("platform et username requis");
  if (!["tiktok", "instagram"].includes(platform)) return err("platform invalide");

  const apiKey = process.env.SCRAPECREATORS_API_KEY;
  if (!apiKey) return err("Clé ScrapeCreators non configurée");

  const handle = username.replace("@", "").trim().toLowerCase();

  // ── PREVIEW ─────────────────────────────────────────────────────────────────
  if (action === "preview") {
    const result = await fetchProfile(platform, handle, apiKey);
    if ("error" in result) return err(result.error);
    return ok({ ...result.data, platform, handle });
  }

  // ── CONFIRM ─────────────────────────────────────────────────────────────────
  if (action === "confirm") {
    // Fetch latest profile data to store
    const result = await fetchProfile(platform, handle, apiKey);
    if ("error" in result) return err(result.error);

    const updateData: Record<string, unknown> = {
      followersCount:      result.data.followers,
      onboardingCompleted: true,
      // verified stays false — pending admin approval
    };
    if (platform === "tiktok") {
      updateData.tiktokHandle = handle;
    } else {
      updateData.instagramHandle = handle;
    }

    await prisma.creatorProfile.update({
      where: { userId: user.id },
      data:  updateData,
    });

    // Notify all admins/managers
    const admins = await prisma.user.findMany({
      where: { role: { in: ["ADMIN", "MANAGER"] } },
      select: { id: true },
    });
    if (admins.length > 0) {
      await prisma.notification.createMany({
        data: admins.map((a) => ({
          userId:  a.id,
          type:    "CREATOR_VERIFY_REQUEST",
          title:   "Nouveau creator à vérifier",
          message: `@${handle} (${platform}) demande une vérification de compte. ${result.data.followers.toLocaleString("fr")} abonnés.`,
          link:    "/dashboard/admin/users",
        })),
        skipDuplicates: true,
      });
    }

    return ok({ ...result.data, platform, handle, pendingVerification: true });
  }

  return err("Action invalide");
}
