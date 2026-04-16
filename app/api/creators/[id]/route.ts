import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, withRateLimit } from "@/lib/api-auth";

// GET /api/creators/[id] — full creator profile
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const limited = await withRateLimit(req);
  if (limited) return limited;

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where:   { id },
    include: {
      creatorProfile: true,
      submissions: {
        where:   { status: "APPROVED" },
        include: { challenge: true, votes: true },
        orderBy: { createdAt: "desc" },
        take:    20,
      },
    },
  });

  if (!user || user.role !== "CREATOR") return err("Creator introuvable", 404);

  return ok({
    id:             user.id,
    name:           user.name,
    avatar:         user.image,
    bio:            user.creatorProfile?.bio,
    city:           user.creatorProfile?.city,
    niches:         user.creatorProfile?.niches ?? [],
    score:          user.creatorProfile?.score ?? 0,
    level:          user.creatorProfile?.level ?? "Rookie",
    tiktokHandle:   user.creatorProfile?.tiktokHandle,
    instagramHandle:user.creatorProfile?.instagramHandle,
    followersCount: user.creatorProfile?.followersCount ?? 0,
    engagementRate: user.creatorProfile?.engagementRate ?? 0,
    pricePerPost:   user.creatorProfile?.pricePerPost,
    pricePerStory:  user.creatorProfile?.pricePerStory,
    pricePerVideo:  user.creatorProfile?.pricePerVideo,
    portfolio:      user.creatorProfile?.portfolio ?? [],
    rating:         user.creatorProfile?.rating ?? 0,
    submissions:    user.submissions.map((s) => ({
      id:          s.id,
      videoUrl:    s.videoUrl,
      caption:     s.caption,
      score:       s.score,
      rank:        s.rank,
      voteCount:   s.votes.reduce((a, v) => a + v.value, 0),
      challenge: {
        id:       s.challenge.id,
        title:    s.challenge.title,
        category: s.challenge.category,
      },
      createdAt: s.createdAt,
    })),
  });
}
