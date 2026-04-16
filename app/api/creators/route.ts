import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, withRateLimit } from "@/lib/api-auth";
import { CreatorQuerySchema } from "@/lib/schemas";

// GET /api/creators — leaderboard, search, filter
export async function GET(req: NextRequest) {
  const limited = await withRateLimit(req);
  if (limited) return limited;

  const { searchParams } = req.nextUrl;
  const parsed = CreatorQuerySchema.safeParse(Object.fromEntries(searchParams));
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? "Paramètres invalides");

  const { search, city, niche, level, page, limit } = parsed.data;

  const where: Record<string, unknown> = { role: "CREATOR" };

  const creators = await prisma.user.findMany({
    where,
    include: { creatorProfile: true },
    orderBy: { creatorProfile: { score: "desc" } },
    skip:  (page - 1) * limit,
    take:  limit,
  });

  const filtered = creators
    .filter((u) => u.creatorProfile !== null)
    .filter((u) => !search || u.name?.toLowerCase().includes(search.toLowerCase()))
    .filter((u) => !city  || u.creatorProfile?.city === city)
    .filter((u) => !niche || u.creatorProfile?.niches.includes(niche))
    .filter((u) => !level || u.creatorProfile?.level === level);

  const total = await prisma.user.count({ where: { role: "CREATOR" } });

  return ok({
    creators: filtered.map((u) => ({
      id:             u.id,
      name:           u.name,
      avatar:         u.image,
      city:           u.creatorProfile?.city,
      niches:         u.creatorProfile?.niches ?? [],
      score:          u.creatorProfile?.score ?? 0,
      level:          u.creatorProfile?.level ?? "Rookie",
      followersCount: u.creatorProfile?.followersCount ?? 0,
      engagementRate: u.creatorProfile?.engagementRate ?? 0,
      pricePerPost:   u.creatorProfile?.pricePerPost,
      rating:         u.creatorProfile?.rating ?? 0,
    })),
    pagination: { page, limit, total },
  });
}

export const dynamic = 'force-dynamic'
