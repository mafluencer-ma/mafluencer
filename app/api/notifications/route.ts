import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, withRateLimit, requireAuth } from "@/lib/api-auth";
import { MarkNotificationsReadSchema } from "@/lib/schemas";

// GET /api/notifications — list notifications for the authenticated user
export async function GET(req: NextRequest) {
  const limited = await withRateLimit(req);
  if (limited) return limited;

  const { user, error } = await requireAuth();
  if (error) return error;

  const { searchParams } = req.nextUrl;
  const unreadOnly = searchParams.get("unread") === "true";
  const page  = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? 20)));

  const where = { userId: user.id, ...(unreadOnly ? { read: false } : {}) };

  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip:  (page - 1) * limit,
      take:  limit,
    }),
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { userId: user.id, read: false } }),
  ]);

  return ok({ notifications, unreadCount, pagination: { page, limit, total } });
}

// PATCH /api/notifications — mark notifications as read
export async function PATCH(req: NextRequest) {
  const limited = await withRateLimit(req);
  if (limited) return limited;

  const { user, error } = await requireAuth();
  if (error) return error;

  const body   = await req.json();
  const parsed = MarkNotificationsReadSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? "Données invalides");

  if (parsed.data.ids && parsed.data.ids.length > 0) {
    // Mark specific notifications
    await prisma.notification.updateMany({
      where: { id: { in: parsed.data.ids }, userId: user.id },
      data:  { read: true },
    });
  } else {
    // Mark all
    await prisma.notification.updateMany({
      where: { userId: user.id, read: false },
      data:  { read: true },
    });
  }

  return ok({ message: "Notifications marquées comme lues" });
}
