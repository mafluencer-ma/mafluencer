import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, withRateLimit, requireRole } from "@/lib/api-auth";
import { awardMissionDelivery } from "@/lib/scoring";
import { notifyMissionPaid } from "@/lib/notifications";

// POST /api/missions/[id]/pay — brand approves delivery and releases payment to creator
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const limited = await withRateLimit(req, "auth");
  if (limited) return limited;

  const { user, error } = await requireRole("BRAND");
  if (error) return error;

  const { id } = await params;

  const mission = await prisma.mission.findUnique({
    where: { id },
    include: { brand: { include: { brandProfile: true } } },
  });

  if (!mission) return err("Mission introuvable", 404);
  if (mission.brandId !== user.id) return err("Accès refusé", 403);
  if (mission.status !== "DELIVERED") return err("La mission n'a pas encore été livrée");

  const commission = mission.budget * 0.15;
  const total      = mission.budget + commission;
  const balance    = mission.brand?.brandProfile?.balance ?? 0;

  if (balance < total)
    return err(`Solde insuffisant. Tu as besoin de ${total.toFixed(2)} MAD (budget + 15% commission).`);

  // Atomic: mark PAID + deduct brand balance + credit creator + record commission
  await prisma.$transaction([
    prisma.mission.update({ where: { id }, data: { status: "PAID" } }),
    prisma.brandProfile.update({
      where: { userId: user.id },
      data:  { balance: { decrement: total } },
    }),
    prisma.transaction.create({
      data: {
        type:       "PAYOUT",
        fromUserId: user.id,
        toUserId:   mission.creatorId,
        amount:     mission.budget,
        currency:   "MAD",
        status:     "COMPLETED",
      },
    }),
    prisma.transaction.create({
      data: {
        type:       "COMMISSION",
        fromUserId: user.id,
        amount:     commission,
        currency:   "MAD",
        status:     "COMPLETED",
      },
    }),
  ]);

  // Award scoring + notify creator
  await awardMissionDelivery(id);
  await notifyMissionPaid(mission.creatorId, mission.budget, mission.title);

  return ok({ message: "Paiement effectué avec succès", amount: mission.budget });
}
