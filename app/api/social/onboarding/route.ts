import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, withRateLimit, requireAuth } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

// ── Shared ScrapeCreators helper ────────────────────────────────────────────

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
          followers: stats?.followerCount ?? info?.followerCount ?? 0,
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

function generateVerifyCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "MAF-";
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// ── POST /api/social/onboarding?action=start ────────────────────────────────
// Fetches profile preview + generates a verifyCode saved to DB
//
// ── POST /api/social/onboarding?action=verify ───────────────────────────────
// Re-fetches profile, checks bio contains verifyCode, marks verified
//
// ── POST /api/social/onboarding?action=skip ─────────────────────────────────
// Sets onboardingCompleted=true without social verification

export async function POST(req: NextRequest) {
  const limited = await withRateLimit(req);
  if (limited) return limited;

  const { user, error } = await requireAuth();
  if (error) return error;

  const action = req.nextUrl.searchParams.get("action") ?? "start";

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

  // ── START ───────────────────────────────────────────────────────────────────
  if (action === "start") {
    const result = await fetchProfile(platform, handle, apiKey);
    if ("error" in result) return err(result.error);

    const verifyCode   = generateVerifyCode();
    const expiry       = new Date(Date.now() + 30 * 60 * 1000); // +30 min

    await prisma.creatorProfile.update({
      where: { userId: user.id },
      data:  { verifyCode, verifyCodeExpiry: expiry },
    });

    return ok({ ...result.data, platform, handle, verifyCode });
  }

  // ── VERIFY ──────────────────────────────────────────────────────────────────
  if (action === "verify") {
    const profile = await prisma.creatorProfile.findUnique({
      where: { userId: user.id },
      select: { verifyCode: true, verifyCodeExpiry: true },
    });

    if (!profile?.verifyCode) return err("Aucun code de vérification en attente");
    if (!profile.verifyCodeExpiry || profile.verifyCodeExpiry < new Date()) {
      return err("Le code a expiré. Recommence depuis le début.");
    }

    const result = await fetchProfile(platform, handle, apiKey);
    if ("error" in result) return err(result.error);

    const bioText = (result.data.bio ?? "").toLowerCase();
    if (!bioText.includes(profile.verifyCode.toLowerCase())) {
      return err(`Code ${profile.verifyCode} non trouvé dans ta bio. Réessaie.`);
    }

    // ✅ Verification passed — save everything
    const updateData: Record<string, unknown> = {
      verified:           true,
      followersCount:     result.data.followers,
      onboardingCompleted: true,
      verifyCode:          null,
      verifyCodeExpiry:    null,
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

    return ok({ ...result.data, platform, handle, verified: true });
  }

  return err("Action invalide");
}
