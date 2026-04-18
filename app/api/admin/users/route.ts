import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, withRateLimit, requireAdmin } from "@/lib/api-auth";

// GET /api/admin/users — list all users
export async function GET(req: NextRequest) {
  const limited = await withRateLimit(req);
  if (limited) return limited;

  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = req.nextUrl;
  const search = searchParams.get("search");
  const role   = searchParams.get("role");
  const page   = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit  = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? 50)));

  const where: Record<string, unknown> = {};
  if (role) where.role = role;
  if (search) {
    where.OR = [
      { name:  { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      include: {
        creatorProfile: { select: { score: true, level: true, followersCount: true } },
        brandProfile:   { select: { companyName: true, balance: true } },
      },
      orderBy: { createdAt: "desc" },
      skip:  (page - 1) * limit,
      take:  limit,
    }),
    prisma.user.count({ where }),
  ]);

  return ok({
    users: users.map((u) => ({
      id:        u.id,
      name:      u.name,
      email:     u.email,
      role:      u.role,
      image:     u.image,
      banned:    u.banned,
      emailVerified: u.emailVerified,
      createdAt: u.createdAt,
      creatorProfile: u.creatorProfile,
      brandProfile:   u.brandProfile,
    })),
    pagination: { page, limit, total },
  });
}

export const dynamic = 'force-dynamic'
