import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, withRateLimit, requireAdmin } from "@/lib/api-auth";

// GET /api/admin/challenges — all challenges with submission counts
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

  const [challenges, total] = await Promise.all([
    prisma.challenge.findMany({
      where,
      include: {
        _count: { select: { submissions: true } },
        brand:  { select: { companyName: true, logo: true } },
      },
      orderBy: { createdAt: "desc" },
      skip:  (page - 1) * limit,
      take:  limit,
    }),
    prisma.challenge.count({ where }),
  ]);

  return ok({ challenges, pagination: { page, limit, total } });
}
