import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, withRateLimit, requireRole } from "@/lib/api-auth";
import { DepositSchema } from "@/lib/schemas";
import { notifyPaymentProcessed } from "@/lib/notifications";

// POST /api/payments/deposit — brand tops up balance
export async function POST(req: NextRequest) {
  const limited = await withRateLimit(req, "auth");
  if (limited) return limited;

  const { user, error } = await requireRole("BRAND");
  if (error) return error;

  const body   = await req.json();
  const parsed = DepositSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? "Données invalides");

  const { amount, paymentMethod } = parsed.data;

  const brand = await prisma.brandProfile.findUnique({ where: { userId: user.id } });
  if (!brand) return err("Profil brand introuvable", 404);

  // Create transaction record + update balance atomically
  const [transaction] = await prisma.$transaction([
    prisma.transaction.create({
      data: {
        type:        "DEPOSIT",
        toUserId:    user.id,
        amount,
        currency:    "MAD",
        status:      "COMPLETED",
        paymentMethod,
      },
    }),
    prisma.brandProfile.update({
      where: { userId: user.id },
      data:  { balance: { increment: amount } },
    }),
  ]);

  await notifyPaymentProcessed(user.id, amount, "DEPOSIT");

  return ok({ transaction, message: `${amount.toLocaleString("fr-MA")} MAD ajoutés à ton solde.` }, 201);
}
