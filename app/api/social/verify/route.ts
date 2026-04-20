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

  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey || apiKey === "your_key_here") {
    return err("Clé RapidAPI non configurée");
  }

  const handle = username.replace("@", "").trim().toLowerCase();
  let profileData: ProfileData;

  try {
    if (platform === "tiktok") {
      const host = process.env.RAPIDAPI_TIKTOK_HOST ?? "tiktok-api23.p.rapidapi.com";
      const res  = await fetch(
        `https://${host}/api/user/info?uniqueId=${encodeURIComponent(handle)}`,
        {
          headers: {
            "X-RapidAPI-Key":  apiKey,
            "X-RapidAPI-Host": host,
          },
        }
      );
      if (!res.ok) return err("Compte TikTok introuvable");
      const data = await res.json();
      const stats    = data?.userInfo?.stats;
      const userInfo = data?.userInfo?.user;
      if (!stats) return err("Compte TikTok introuvable ou privé");

      profileData = {
        followers: stats.followerCount  ?? 0,
        following: stats.followingCount ?? 0,
        posts:     stats.videoCount     ?? 0,
        nickname:  userInfo?.nickname,
        avatar:    userInfo?.avatarMedium,
      };
    } else {
      const host = process.env.RAPIDAPI_INSTAGRAM_HOST ?? "instagram-scraper-api2.p.rapidapi.com";
      const res  = await fetch(
        `https://${host}/v1/info?username_or_id_or_url=${encodeURIComponent(handle)}`,
        {
          headers: {
            "X-RapidAPI-Key":  apiKey,
            "X-RapidAPI-Host": host,
          },
        }
      );
      if (!res.ok) return err("Compte Instagram introuvable");
      const data = await res.json();
      const d = data?.data;
      if (!d) return err("Compte Instagram introuvable ou privé");

      profileData = {
        followers: d.follower_count  ?? 0,
        following: d.following_count ?? 0,
        posts:     d.media_count     ?? 0,
        bio:       d.biography,
        avatar:    d.profile_pic_url,
        nickname:  d.full_name,
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
