import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, withRateLimit, requireRole } from "@/lib/api-auth";
import { WithdrawSchema } from "@/lib/schemas";

// POST /api/payments/withdraw — creator requests withdrawal
export async function POST(req: NextRequest) {
  const limited = await withRateLimit(req, "auth");
  if (limited) return limited;

  const { user, error } = await requireRole("CREATOR");
  if (error) return error;

  const body   = await req.json();
  const parsed = WithdrawSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? "Données invalides");

  const { amount, bankAccount } = parsed.data;

  // Check pending withdrawal
  const pendingWithdrawal = await prisma.transaction.findFirst({
    where: { fromUserId: user.id, type: "PAYOUT", status: "PENDING" },
  });
  if (pendingWithdrawal)
    return err("Tu as déjà un retrait en attente. Attend qu'il soit traité.");

  // Check creator balance (sum of COMPLETED incoming - COMPLETED outgoing)
  const balance = await getCreatorBalance(user.id);
  if (balance < amount)
    return err(`Solde insuffisant. Ton solde disponible est de ${balance.toFixed(2)} MAD.`);

  const transaction = await prisma.transaction.create({
    data: {
      type:        "PAYOUT",
      fromUserId:  user.id,
      amount,
      currency:    "MAD",
      status:      "PENDING",
      paymentMethod: bankAccount,
    },
  });

  return ok({ transaction, message: "Demande de retrait soumise. Traitement sous 2-3 jours ouvrables." }, 201);
}

async function getCreatorBalance(userId: string): Promise<number> {
  const [incoming, outgoing] = await Promise.all([
    prisma.transaction.aggregate({
      where:  { toUserId: userId, status: "COMPLETED" },
      _sum:   { amount: true },
    }),
    prisma.transaction.aggregate({
      where:  { fromUserId: userId, status: "COMPLETED", type: "PAYOUT" },
      _sum:   { amount: true },
    }),
  ]);
  return (incoming._sum.amount ?? 0) - (outgoing._sum.amount ?? 0);
}
