import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/youcanpay";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.formData();
  const transaction_id = body.get("transaction_id") as string;
  const amount = body.get("amount") as string;
  const currency_id = body.get("currency_id") as string;
  const hash_string = body.get("hash_string") as string;
  const order_id = body.get("order_id") as string;
  const payment_status = body.get("payment_status") as string;

  const isValid = verifyWebhookSignature(transaction_id, amount, currency_id, hash_string);
  if (!isValid) return NextResponse.json({ error: "Invalid signature" }, { status: 400 });

  if (payment_status === "paid") {
    const lienId = order_id.split("-").slice(0, -1).join("-");
    await prisma.lienPaiement.update({
      where: { id: lienId },
      data: { statut: "PAYE" },
    });
    console.log("[YouCanPay] Payment confirmed:", lienId, amount);
  }

  return NextResponse.json({ ok: true });
}
