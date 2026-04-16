import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, withRateLimit, requireAdmin } from "@/lib/api-auth";
import { AdminPaymentActionSchema } from "@/lib/schemas";
import { notifyPaymentProcessed, notifyPaymentRejected } from "@/lib/notifications";

// PATCH /api/admin/payments/[id] — mark withdrawal as PAID or REJECTED
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const limited = await withRateLimit(req);
  if (limited) return limited;

  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;

  const transaction = await prisma.transaction.findUnique({ where: { id } });
  if (!transaction) return err("Transaction introuvable", 404);
  if (transaction.type !== "PAYOUT") return err("Cette transaction n'est pas un retrait");
  if (transaction.status !== "PENDING") return err("Ce retrait a déjà été traité");

  const body   = await req.json();
  const parsed = AdminPaymentActionSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? "Données invalides");

  const { action, note } = parsed.data;
  const status = action === "PAID" ? "COMPLETED" : "FAILED";

  await prisma.transaction.update({
    where: { id },
    data:  { status },
  });

  if (!transaction.fromUserId) return ok({ message: "Transaction mise à jour" });

  if (action === "PAID") {
    await notifyPaymentProcessed(transaction.fromUserId, transaction.amount, "WITHDRAWAL");
  } else {
    await notifyPaymentRejected(transaction.fromUserId, transaction.amount, note);
  }

  return ok({ message: action === "PAID" ? "Retrait marqué comme payé" : "Retrait refusé" });
}
