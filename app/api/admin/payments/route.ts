import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, withRateLimit, requireAdmin } from "@/lib/api-auth";

// GET /api/admin/payments — list all transactions (deposits, payouts, commissions)
export async function GET(req: NextRequest) {
  const limited = await withRateLimit(req);
  if (limited) return limited;

  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = req.nextUrl;
  const status = searchParams.get("status");
  const type   = searchParams.get("type");
  const page   = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit  = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? 50)));

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (type)   where.type   = type;

  const [transactions, total, pendingAgg, depositAgg, payoutAgg] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: {
        fromUser: { select: { id: true, name: true, email: true, role: true } },
        toUser:   { select: { id: true, name: true, email: true, role: true } },
      },
      orderBy: { createdAt: "desc" },
      skip:  (page - 1) * limit,
      take:  limit,
    }),
    prisma.transaction.count({ where }),
    prisma.transaction.aggregate({
      where: { status: "PENDING", type: "PAYOUT" },
      _sum:  { amount: true },
      _count: true,
    }),
    prisma.transaction.aggregate({
      where: { status: "COMPLETED", type: "DEPOSIT" },
      _sum:  { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { status: "COMPLETED", type: "PAYOUT" },
      _sum:  { amount: true },
    }),
  ]);

  return ok({
    transactions,
    stats: {
      pendingPayouts:      pendingAgg._count,
      pendingPayoutAmount: pendingAgg._sum.amount ?? 0,
      totalDeposits:       depositAgg._sum.amount ?? 0,
      totalPayouts:        payoutAgg._sum.amount  ?? 0,
    },
    pagination: { page, limit, total },
  });
}

export const dynamic = "force-dynamic";
