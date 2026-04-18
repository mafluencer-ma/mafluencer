import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, withRateLimit, requireAdmin } from "@/lib/api-auth";

// GET /api/admin/stats — platform overview numbers
export async function GET(req: NextRequest) {
  const limited = await withRateLimit(req);
  if (limited) return limited;

  const { error } = await requireAdmin();
  if (error) return error;

  const [
    totalUsers,
    creators,
    brands,
    admins,
    totalChallenges,
    activeChallenges,
    totalMissions,
    totalSubmissions,
    pendingSubmissions,
    recentSignups,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "CREATOR" } }),
    prisma.user.count({ where: { role: "BRAND" } }),
    prisma.user.count({ where: { role: "ADMIN" } }),
    prisma.challenge.count(),
    prisma.challenge.count({ where: { status: "ACTIVE" } }),
    prisma.mission.count(),
    prisma.submission.count(),
    prisma.submission.count({ where: { status: "PENDING" } }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id:        true,
        name:      true,
        email:     true,
        role:      true,
        image:     true,
        createdAt: true,
        banned:    true,
      },
    }),
  ]);

  return ok({
    totalUsers,
    creators,
    brands,
    admins,
    totalChallenges,
    activeChallenges,
    totalMissions,
    totalSubmissions,
    pendingSubmissions,
    recentSignups,
  });
}

export const dynamic = "force-dynamic";
