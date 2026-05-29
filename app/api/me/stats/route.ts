import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, withRateLimit, requireAuth } from "@/lib/api-auth";

// GET /api/me/stats — aggregated stats for the authenticated user (creator or brand)
export async function GET(req: NextRequest) {
  const limited = await withRateLimit(req);
  if (limited) return limited;

  const { user, error } = await requireAuth();
  if (error) return error;

  try {
    if (user.role === "CREATOR") {
      const [submissions, missions, profile] = await Promise.all([
        prisma.submission.findMany({
          where: { creatorId: user.id },
          select: {
            id: true, views: true, likes: true, shares: true,
            comments: true, saves: true, score: true,
            earnedAmount: true, status: true, verificationStatus: true,
            createdAt: true, caption: true, platform: true,
            challenge: { select: { title: true, category: true } },
          },
          orderBy: { createdAt: "desc" },
        }),
        prisma.mission.findMany({
          where: { creatorId: user.id },
          select: { id: true, budget: true, status: true, type: true, createdAt: true },
        }),
        prisma.creatorProfile.findUnique({
          where: { userId: user.id },
          select: { score: true, level: true, followersCount: true, engagementRate: true, niches: true },
        }),
      ]);

      const totalViews    = submissions.reduce((a, s) => a + s.views,    0);
      const totalLikes    = submissions.reduce((a, s) => a + s.likes,    0);
      const totalShares   = submissions.reduce((a, s) => a + s.shares,   0);
      const totalComments = submissions.reduce((a, s) => a + s.comments, 0);
      const totalSaves    = submissions.reduce((a, s) => a + s.saves,    0);
      const totalEarned   = missions
        .filter((m) => m.status === "PAID")
        .reduce((a, m) => a + m.budget, 0);

      const missionsByStatus = {
        PENDING:   missions.filter((m) => m.status === "PENDING").length,
        ACCEPTED:  missions.filter((m) => m.status === "ACCEPTED").length,
        DELIVERED: missions.filter((m) => m.status === "DELIVERED").length,
        PAID:      missions.filter((m) => m.status === "PAID").length,
      };

      const bestSubmission = submissions.reduce<typeof submissions[number] | null>(
        (best, s) => (!best || s.views > best.views ? s : best),
        null
      );

      // Last 6 submissions for chart (oldest first)
      const chartSubmissions = submissions
        .slice(0, 6)
        .reverse()
        .map((s, i) => ({
          name:     s.challenge?.title?.slice(0, 16) ?? `Défi ${i + 1}`,
          views:    s.views,
          likes:    s.likes,
          score:    Math.round(s.score),
          category: s.challenge?.category ?? "",
        }));

      return ok({
        role: "CREATOR",
        profile: {
          score:          profile?.score          ?? 0,
          level:          profile?.level          ?? "Rookie",
          followersCount: profile?.followersCount ?? 0,
          engagementRate: profile?.engagementRate ?? 0,
          niches:         profile?.niches         ?? [],
        },
        submissions: {
          total:          submissions.length,
          approved:       submissions.filter((s) => s.status === "APPROVED").length,
          totalViews,
          totalLikes,
          totalShares,
          totalComments,
          totalSaves,
          chart:          chartSubmissions,
          best: bestSubmission
            ? {
                views:    bestSubmission.views,
                likes:    bestSubmission.likes,
                challenge: bestSubmission.challenge?.title ?? "Défi",
                category:  bestSubmission.challenge?.category ?? "",
                platform:  bestSubmission.platform ?? "",
                score:     Math.round(bestSubmission.score),
              }
            : null,
        },
        missions: {
          total:       missions.length,
          totalEarned,
          byStatus:    missionsByStatus,
        },
      });
    }

    if (user.role === "BRAND") {
      const [missions, challenges, brandProfile] = await Promise.all([
        prisma.mission.findMany({
          where: { brandId: user.id },
          select: {
            id: true, budget: true, status: true, type: true, createdAt: true,
            creator: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: "desc" },
        }),
        prisma.challenge.findMany({
          where: { createdBy: { id: user.id } },
          select: { id: true, status: true, title: true },
        }),
        prisma.brandProfile.findUnique({
          where: { userId: user.id },
          select: { balance: true, companyName: true },
        }),
      ]);

      const totalSpent   = missions
        .filter((m) => m.status === "PAID" || m.status === "DELIVERED")
        .reduce((a, m) => a + m.budget, 0);
      const uniqueCreators = new Set(missions.map((m) => m.creator.id)).size;

      const missionsByStatus = {
        PENDING:   missions.filter((m) => m.status === "PENDING").length,
        ACCEPTED:  missions.filter((m) => m.status === "ACCEPTED").length,
        DELIVERED: missions.filter((m) => m.status === "DELIVERED").length,
        PAID:      missions.filter((m) => m.status === "PAID").length,
      };

      const missionsByType = {
        POST:  missions.filter((m) => m.type === "POST").length,
        STORY: missions.filter((m) => m.type === "STORY").length,
        VIDEO: missions.filter((m) => m.type === "VIDEO").length,
        UGC:   missions.filter((m) => m.type === "UGC").length,
      };

      // Monthly spend for last 6 months
      const now = new Date();
      const monthlySpend = Array.from({ length: 6 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
        const label = d.toLocaleDateString("fr-FR", { month: "short" });
        const total = missions
          .filter((m) => {
            const mc = new Date(m.createdAt);
            return mc.getFullYear() === d.getFullYear() && mc.getMonth() === d.getMonth();
          })
          .reduce((a, m) => a + m.budget, 0);
        return { month: label, total };
      });

      return ok({
        role: "BRAND",
        brand: {
          balance:     brandProfile?.balance     ?? 0,
          companyName: brandProfile?.companyName ?? "",
        },
        missions: {
          total:        missions.length,
          totalSpent,
          avgBudget:    missions.length ? Math.round(totalSpent / missions.length) : 0,
          uniqueCreators,
          byStatus:     missionsByStatus,
          byType:       missionsByType,
          monthlySpend,
        },
        challenges: {
          total:     challenges.length,
          active:    challenges.filter((c) => c.status === "ACTIVE").length,
          completed: challenges.filter((c) => c.status === "COMPLETED").length,
        },
      });
    }

    return err("Rôle non supporté", 400);
  } catch (e) {
    console.error(e);
    return err("Erreur serveur", 500);
  }
}

export const dynamic = "force-dynamic";
