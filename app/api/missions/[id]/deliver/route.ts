import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, withRateLimit, requireRole } from "@/lib/api-auth";
import { DeliverMissionSchema } from "@/lib/schemas";
import { notifyMissionDelivered } from "@/lib/notifications";

// POST /api/missions/[id]/deliver — creator delivers content
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const limited = await withRateLimit(req);
  if (limited) return limited;

  const { user, error } = await requireRole("CREATOR");
  if (error) return error;

  const { id } = await params;

  const mission = await prisma.mission.findUnique({ where: { id } });
  if (!mission) return err("Mission introuvable", 404);
  if (mission.creatorId !== user.id) return err("Accès refusé", 403);
  if (mission.status !== "ACCEPTED") return err("Tu dois d'abord accepter la mission");

  const body   = await req.json();
  const parsed = DeliverMissionSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? "Données invalides");

  await prisma.mission.update({
    where: { id },
    data:  { status: "DELIVERED", contentUrl: parsed.data.contentUrl },
  });

  const creatorName = user.name ?? "Le creator";
  await notifyMissionDelivered(mission.brandId, creatorName, mission.title);

  return ok({ message: "Contenu livré avec succès" });
}
