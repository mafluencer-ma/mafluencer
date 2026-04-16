import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, withRateLimit, requireAuth } from "@/lib/api-auth";

// GET /api/missions/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const limited = await withRateLimit(req);
  if (limited) return limited;

  const { user, error } = await requireAuth();
  if (error) return error;

  const { id } = await params;

  const mission = await prisma.mission.findUnique({
    where: { id },
    include: {
      brand:   { include: { brandProfile: true } },
      creator: { include: { creatorProfile: true } },
    },
  });

  if (!mission) return err("Mission introuvable", 404);

  // Only the brand, the creator, or an admin can view
  if (
    user.role !== "ADMIN" &&
    mission.brandId   !== user.id &&
    mission.creatorId !== user.id
  ) return err("Accès refusé", 403);

  return ok({ mission });
}

// PATCH /api/missions/[id] — brand updates mission (status only for now)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const limited = await withRateLimit(req);
  if (limited) return limited;

  const { user, error } = await requireAuth();
  if (error) return error;

  const { id } = await params;

  const mission = await prisma.mission.findUnique({ where: { id } });
  if (!mission) return err("Mission introuvable", 404);

  if (user.role !== "ADMIN" && mission.brandId !== user.id)
    return err("Accès refusé", 403);

  const body = await req.json();

  const updated = await prisma.mission.update({
    where: { id },
    data:  body,
  });

  return ok({ mission: updated });
}
