import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, withRateLimit, requireAuth } from "@/lib/api-auth";

// GET /api/me/transactions — transactions for the current user + current balance
export async function GET(req: NextRequest) {
  const limited = await withRateLimit(req);
  if (limited) return limited;

  const { user, error } = await requireAuth();
  if (error) return error;

  try {
    const { searchParams } = req.nextUrl;
    const page  = Math.max(1, Number(searchParams.get("page")  ?? 1));
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? 20)));

    const where = {
      OR: [
        { fromUserId: user.id },
        { toUserId:   user.id },
      ],
    };

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip:  (page - 1) * limit,
        take:  limit,
      }),
      prisma.transaction.count({ where }),
    ]);

    // Compute available balance
    let balance = 0;
    if (user.role === "CREATOR") {
      const [incoming, outgoing] = await Promise.all([
        prisma.transaction.aggregate({
          where: { toUserId: user.id, status: "COMPLETED" },
          _sum:  { amount: true },
        }),
        prisma.transaction.aggregate({
          where: { fromUserId: user.id, status: "COMPLETED", type: "PAYOUT" },
          _sum:  { amount: true },
        }),
      ]);
      balance = (incoming._sum.amount ?? 0) - (outgoing._sum.amount ?? 0);
    } else if (user.role === "BRAND") {
      const brand = await prisma.brandProfile.findUnique({
        where:  { userId: user.id },
        select: { balance: true },
      });
      balance = brand?.balance ?? 0;
    }

    return ok({
      transactions: transactions.map((t) => ({
        id:            t.id,
        type:          t.type,
        amount:        t.amount,
        currency:      t.currency,
        status:        t.status,
        paymentMethod: t.paymentMethod,
        createdAt:     t.createdAt,
        fromUserId:    t.fromUserId,
        toUserId:      t.toUserId,
      })),
      balance,
      pagination: { page, limit, total },
    });
  } catch (e) {
    console.error(e);
    return err("Erreur serveur", 500);
  }
}

export const dynamic = "force-dynamic";
