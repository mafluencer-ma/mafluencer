import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, withRateLimit, requireRole } from "@/lib/api-auth";
import { notifyMissionAccepted } from "@/lib/notifications";

// POST /api/missions/[id]/accept — creator accepts mission
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const limited = await withRateLimit(req);
  if (limited) return limited;

  const { user, error } = await requireRole("CREATOR");
  if (error) return error;

  const { id } = await params;

  const mission = await prisma.mission.findUnique({
    where: { id },
    include: { brand: { include: { brandProfile: true } } },
  });

  if (!mission) return err("Mission introuvable", 404);
  if (mission.creatorId !== user.id) return err("Accès refusé", 403);
  if (mission.status !== "PENDING") return err("Cette mission ne peut plus être acceptée");

  await prisma.mission.update({
    where: { id },
    data:  { status: "ACCEPTED" },
  });

  const creatorName = user.name ?? "Le creator";
  await notifyMissionAccepted(mission.brandId, creatorName, mission.title);

  return ok({ message: "Mission acceptée" });
}
