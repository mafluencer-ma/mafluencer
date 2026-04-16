import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, withRateLimit, requireAuth, requireRole } from "@/lib/api-auth";
import { CreateMissionSchema } from "@/lib/schemas";
import { notifyMissionReceived } from "@/lib/notifications";

// GET /api/missions — list missions for the authenticated user
export async function GET(req: NextRequest) {
  const limited = await withRateLimit(req);
  if (limited) return limited;

  const { user, error } = await requireAuth();
  if (error) return error;

  const { searchParams } = req.nextUrl;
  const status = searchParams.get("status");
  const page   = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit  = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? 20)));

  const where: Record<string, unknown> =
    user.role === "BRAND"   ? { brandId: user.id } :
    user.role === "CREATOR" ? { creatorId: user.id } :
    {}; // ADMIN sees all

  if (status) where.status = status;

  const [missions, total] = await Promise.all([
    prisma.mission.findMany({
      where,
      include: {
        brand:   { include: { brandProfile: { select: { companyName: true, logo: true } } } },
        creator: { select: { id: true, name: true, image: true } },
      },
      orderBy: { createdAt: "desc" },
      skip:  (page - 1) * limit,
      take:  limit,
    }),
    prisma.mission.count({ where }),
  ]);

  return ok({
    missions: missions.map((m) => ({
      id:          m.id,
      title:       m.title,
      brief:       m.brief,
      budget:      m.budget,
      type:        m.type,
      status:      m.status,
      contentUrl:  m.contentUrl,
      deliveryDate:m.deliveryDate,
      createdAt:   m.createdAt,
      brand: m.brand?.brandProfile
        ? { name: m.brand.brandProfile.companyName, logo: m.brand.brandProfile.logo }
        : null,
      creator: m.creator,
    })),
    pagination: { page, limit, total },
  });
}

// POST /api/missions — brand creates a mission
export async function POST(req: NextRequest) {
  const limited = await withRateLimit(req);
  if (limited) return limited;

  const { user, error } = await requireRole("BRAND");
  if (error) return error;

  const body   = await req.json();
  const parsed = CreateMissionSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? "Données invalides");

  const data = parsed.data;

  // Verify creator exists
  const creator = await prisma.user.findUnique({
    where: { id: data.creatorId },
    select: { id: true, name: true, role: true },
  });
  if (!creator || creator.role !== "CREATOR") return err("Creator introuvable");

  // Verify brand has sufficient balance
  const brand = await prisma.brandProfile.findUnique({ where: { userId: user.id } });
  if (!brand) return err("Profil brand introuvable", 404);

  const commission = data.budget * 0.15;
  const total      = data.budget + commission;
  if (brand.balance < total)
    return err(`Solde insuffisant. Tu as besoin de ${total.toFixed(2)} MAD (budget + 15% commission).`);

  const mission = await prisma.mission.create({
    data: {
      brandId:     user.id,
      creatorId:   data.creatorId,
      title:       data.title,
      brief:       data.brief,
      budget:      data.budget,
      type:        data.type,
      deliveryDate:data.deliveryDate,
      status:      "PENDING",
    },
  });

  // Notify creator
  const brandName = brand.companyName ?? "Une brand";
  await notifyMissionReceived(data.creatorId, brandName, data.title, mission.id);

  return ok({ mission }, 201);
}
