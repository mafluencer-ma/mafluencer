import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, withRateLimit, requireAdmin } from "@/lib/api-auth";

// POST /api/admin/users/[id]/role — change user role
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const limited = await withRateLimit(req);
  if (limited) return limited;

  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return err("Utilisateur introuvable", 404);

  const { role } = await req.json() as { role?: string };
  if (!["CREATOR", "BRAND", "ADMIN"].includes(role ?? "")) {
    return err("Rôle invalide");
  }

  const updated = await prisma.user.update({
    where: { id },
    data:  { role: role as "CREATOR" | "BRAND" | "ADMIN" },
  });

  return ok({ user: { id: updated.id, email: updated.email, role: updated.role } });
}

export const dynamic = "force-dynamic";
