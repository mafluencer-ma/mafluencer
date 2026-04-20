import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, withRateLimit, requireAuth } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

type VerifyBody = {
  platform: "tiktok" | "instagram";
  username: string;
};

type ProfileData = {
  followers: number;
  following: number;
  posts:     number;
  nickname?: string;
  avatar?:   string;
  bio?:      string;
};

export async function POST(req: NextRequest) {
  const limited = await withRateLimit(req);
  if (limited) return limited;

  const { user, error } = await requireAuth();
  if (error) return error;

  const body = await req.json() as VerifyBody;
  const { platform, username } = body;

  if (!platform || !username?.trim()) {
    return err("platform et username requis");
  }
  if (!["tiktok", "instagram"].includes(platform)) {
    return err("platform invalide");
  }

  const apiKey = process.env.SCRAPECREATORS_API_KEY;
  if (!apiKey) {
    return err("Clé ScrapeCreators non configurée");
  }

  const handle = username.replace("@", "").trim().toLowerCase();
  let profileData: ProfileData;

  try {
    if (platform === "tiktok") {
      const res = await fetch(
        `https://api.scrapecreators.com/v1/tiktok/profile?handle=${encodeURIComponent(handle)}`,
        { headers: { "x-api-key": apiKey } }
      );
      if (!res.ok) return err("Compte TikTok introuvable");
      const data = await res.json();

      // ScrapeCreators TikTok response shape
      const stats = data?.stats ?? data?.userInfo?.stats;
      const info  = data?.user  ?? data?.userInfo?.user ?? data;
      if (!stats && !info?.followerCount) return err("Compte TikTok introuvable ou privé");

      profileData = {
        followers: stats?.followerCount ?? info?.followerCount ?? 0,
        following: stats?.followingCount ?? info?.followingCount ?? 0,
        posts:     stats?.videoCount     ?? info?.videoCount     ?? 0,
        nickname:  info?.nickname        ?? info?.displayName,
        avatar:    info?.avatarMedium    ?? info?.avatar,
        bio:       info?.signature       ?? info?.bio,
      };
    } else {
      const res = await fetch(
        `https://api.scrapecreators.com/v1/instagram/profile?handle=${encodeURIComponent(handle)}`,
        { headers: { "x-api-key": apiKey } }
      );
      if (!res.ok) return err("Compte Instagram introuvable");
      const data = await res.json();

      // ScrapeCreators Instagram response shape
      const d = data?.user ?? data?.data ?? data;
      if (!d) return err("Compte Instagram introuvable ou privé");

      profileData = {
        followers: d.follower_count  ?? d.followers ?? 0,
        following: d.following_count ?? d.following ?? 0,
        posts:     d.media_count     ?? d.posts     ?? 0,
        bio:       d.biography       ?? d.bio,
        avatar:    d.profile_pic_url ?? d.avatar,
        nickname:  d.full_name       ?? d.name,
      };
    }
  } catch {
    return err("Impossible de vérifier le compte. Réessaie plus tard.");
  }

  // Update CreatorProfile: mark verified, update follower count, save handle
  const updateData: Record<string, unknown> = {
    verified:      true,
    followersCount: profileData.followers,
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

  return ok({ ...profileData, platform, handle, verified: true });
}
