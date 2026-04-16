import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, withRateLimit, requireAuth } from "@/lib/api-auth";
import { CreateChallengeSchema } from "@/lib/schemas";

// GET /api/challenges — list active/upcoming challenges
export async function GET(req: NextRequest) {
  const limited = await withRateLimit(req);
  if (limited) return limited;

  const { searchParams } = req.nextUrl;
  const status   = searchParams.get("status") ?? "ACTIVE";
  const category = searchParams.get("category");
  const page     = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit    = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? 20)));

  const where: Record<string, unknown> = {};
  if (status !== "all") where.status = status;
  if (category) where.category = category;

  const [challenges, total] = await Promise.all([
    prisma.challenge.findMany({
      where,
      include: {
        _count: { select: { submissions: true } },
        brand:  { select: { companyName: true, logo: true } },
      },
      orderBy: { startDate: "desc" },
      skip:  (page - 1) * limit,
      take:  limit,
    }),
    prisma.challenge.count({ where }),
  ]);

  return ok({
    challenges: challenges.map((c) => ({
      id:           c.id,
      title:        c.title,
      description:  c.description,
      category:     c.category,
      type:         c.type,
      status:       c.status,
      startDate:    c.startDate,
      endDate:      c.endDate,
      prizeAmount:  c.prizeAmount,
      rules:        c.rules,
      submissionCount: c._count.submissions,
      brand: c.brand
        ? { name: c.brand.companyName, logo: c.brand.logo }
        : null,
    })),
    pagination: { page, limit, total },
  });
}

// POST /api/challenges — create challenge (ADMIN or BRAND)
export async function POST(req: NextRequest) {
  const limited = await withRateLimit(req);
  if (limited) return limited;

  const { user, error } = await requireAuth();
  if (error) return error;
  if (user.role !== "ADMIN" && user.role !== "BRAND") return err("Accès refusé", 403);

  const body   = await req.json();
  const parsed = CreateChallengeSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? "Données invalides");

  const data = parsed.data;

  if (data.startDate >= data.endDate)
    return err("La date de fin doit être après la date de début");

  const challenge = await prisma.challenge.create({
    data: {
      title:       data.title,
      description: data.description,
      category:    data.category,
      type:        data.type,
      startDate:   data.startDate,
      endDate:     data.endDate,
      prizeAmount: data.prizeAmount,
      rules:       data.rules,
      brandId:     user.role === "BRAND" ? user.id : (data.brandId ?? null),
      status:      "DRAFT",
    },
  });

  return ok({ challenge }, 201);
}
