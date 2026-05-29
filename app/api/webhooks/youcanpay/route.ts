import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/webhooks/youcanpay
// Called by YouCan Pay after a payment completes or fails.
// Configure this URL in your YouCan Pay dashboard → Webhooks.
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const event   = (body as Record<string, unknown>)?.event_name as string | undefined;
  const payload = (body as Record<string, unknown>)?.payload   as Record<string, unknown> | undefined;
  const txn     = payload?.transaction as Record<string, unknown> | undefined;
  const orderId = txn?.order_id as string | undefined;
  const status  = txn?.status  as string | undefined;

  if (!orderId) {
    return NextResponse.json({ error: "Missing order_id" }, { status: 400 });
  }

  try {
    if (event === "transaction.paid" || status === "paid") {
      const transaction = await prisma.transaction.findUnique({
        where: { id: orderId },
      });

      if (!transaction) {
        console.error(`[YouCan Pay Webhook] Unknown transaction: ${orderId}`);
        return NextResponse.json({ ok: true }); // 200 so YouCan Pay won't retry endlessly
      }

      // Idempotency — skip if already processed
      if (transaction.status === "COMPLETED") {
        return NextResponse.json({ ok: true });
      }

      if (!transaction.toUserId) {
        console.error(`[YouCan Pay Webhook] Transaction ${orderId} has no toUserId`);
        return NextResponse.json({ error: "Bad transaction" }, { status: 500 });
      }

      // Credit balance + mark completed atomically
      await prisma.$transaction([
        prisma.transaction.update({
          where: { id: orderId },
          data:  { status: "COMPLETED" },
        }),
        prisma.brandProfile.update({
          where: { userId: transaction.toUserId },
          data:  { balance: { increment: transaction.amount } },
        }),
      ]);

      console.log(`[YouCan Pay Webhook] +${transaction.amount} MAD credited to ${transaction.toUserId}`);

    } else if (event === "transaction.failed" || status === "failed") {
      await prisma.transaction.updateMany({
        where: { id: orderId, status: "PENDING" },
        data:  { status: "FAILED" },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[YouCan Pay Webhook] Error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
