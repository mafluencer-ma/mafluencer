import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, err, withRateLimit, requireRole } from "@/lib/api-auth";
import { createPaymentToken, paymentRedirectUrls } from "@/lib/youcanpay";

const CheckoutSchema = z.object({
  amount: z.number().positive().min(500, "Montant minimum : 500 MAD").max(500_000, "Montant maximum : 500 000 MAD"),
});

// POST /api/payments/youcanpay/checkout
// Creates a PENDING transaction then a YouCan Pay payment token.
// Returns { paymentUrl } — client redirects the browser there.
export async function POST(req: NextRequest) {
  const limited = await withRateLimit(req, "auth");
  if (limited) return limited;

  const { user, error } = await requireRole("BRAND");
  if (error) return error;

  const body = await req.json();
  const parsed = CheckoutSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? "Données invalides");

  const { amount } = parsed.data;

  // 1. Persist a PENDING transaction so we have an ID to use as order_id
  const transaction = await prisma.transaction.create({
    data: {
      type:          "DEPOSIT",
      toUserId:      user.id,
      amount,
      currency:      "MAD",
      status:        "PENDING",
      paymentMethod: "youcanpay",
    },
  });

  const ip = (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "127.0.0.1"
  );

  const { success_url, error_url } = paymentRedirectUrls(transaction.id);

  try {
    const { token, paymentUrl } = await createPaymentToken({
      order_id:      transaction.id,
      amount:        Math.round(amount * 100), // MAD → centimes
      currency:      "MAD",
      customer_ip:   ip,
      success_url,
      error_url,
      customer_info: {
        name:  user.name  ?? undefined,
        email: user.email ?? undefined,
      },
    });

    // Store token so we can correlate the webhook (failsafe alongside order_id)
    await prisma.transaction.update({
      where: { id: transaction.id },
      data:  { paymentMethod: `youcanpay:${token}` },
    });

    return ok({ paymentUrl, transactionId: transaction.id });
  } catch (e) {
    // Roll back the pending transaction — payment page was never reached
    await prisma.transaction.delete({ where: { id: transaction.id } }).catch(() => {});
    console.error("[YouCan Pay] checkout error:", e);
    return err("Impossible de créer la session de paiement. Réessaie.", 502);
  }
}

export const dynamic = "force-dynamic";
