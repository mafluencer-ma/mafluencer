import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, withRateLimit, requireRole } from "@/lib/api-auth";

// POST /api/missions/[id]/refuse — creator refuses a pending mission
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const limited = await withRateLimit(req);
  if (limited) return limited;

  const { user, error } = await requireRole("CREATOR");
  if (error) return error;

  const { id } = await params;

  try {
    const mission = await prisma.mission.findUnique({ where: { id } });
    if (!mission)                       return err("Mission introuvable", 404);
    if (mission.creatorId !== user.id)  return err("Accès refusé", 403);
    if (mission.status !== "PENDING")   return err("Cette mission ne peut plus être refusée");

    await prisma.mission.delete({ where: { id } });

    return ok({ message: "Mission refusée" });
  } catch (e) {
    console.error(e);
    return err("Erreur serveur", 500);
  }
}

export const dynamic = "force-dynamic";
