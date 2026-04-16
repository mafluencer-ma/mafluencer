import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, withRateLimit, requireAdmin } from "@/lib/api-auth";

// GET /api/admin/missions — all missions with commission breakdown
export async function GET(req: NextRequest) {
  const limited = await withRateLimit(req);
  if (limited) return limited;

  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = req.nextUrl;
  const status = searchParams.get("status");
  const page   = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit  = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? 50)));

  const where: Record<string, unknown> = {};
  if (status) where.status = status;

  const [missions, total] = await Promise.all([
    prisma.mission.findMany({
      where,
      include: {
        brand:   { include: { brandProfile: { select: { companyName: true } } } },
        creator: { select: { id: true, name: true, image: true } },
      },
      orderBy: { createdAt: "desc" },
      skip:  (page - 1) * limit,
      take:  limit,
    }),
    prisma.mission.count({ where }),
  ]);

  const totalRevenue = await prisma.mission.aggregate({
    where: { status: "PAID" },
    _sum:  { budget: true },
  });

  return ok({
    missions: missions.map((m: any) => ({
      ...m,
      commission: m.budget * 0.15,
    })),
    stats: {
      totalRevenue: totalRevenue._sum.budget ?? 0,
      totalCommission: (totalRevenue._sum.budget ?? 0) * 0.15,
    },
    pagination: { page, limit, total },
  });
}
