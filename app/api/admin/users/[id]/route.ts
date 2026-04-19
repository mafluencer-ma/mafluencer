import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, withRateLimit, requireAdmin } from "@/lib/api-auth";
import { AdminUpdateUserSchema } from "@/lib/schemas";

// PATCH /api/admin/users/[id] — change role, ban/unban
export async function PATCH(
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

  const body   = await req.json();
  const parsed = AdminUpdateUserSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? "Données invalides");

  // Protect: cannot demote ADMIN or MANAGER to a lower role
  if (
    (user.role === "ADMIN" || user.role === "MANAGER") &&
    parsed.data.role &&
    parsed.data.role !== "ADMIN" &&
    parsed.data.role !== "MANAGER"
  ) {
    return err("Impossible de déclasser un admin ou manager");
  }

  const updated = await prisma.user.update({
    where: { id },
    data:  {
      ...(parsed.data.role   !== undefined ? { role:   parsed.data.role }   : {}),
      ...(parsed.data.banned !== undefined ? { banned: parsed.data.banned } : {}),
    },
  });

  return ok({
    user: { id: updated.id, name: updated.name, email: updated.email, role: updated.role, banned: updated.banned },
  });
}

// DELETE /api/admin/users/[id]
export async function DELETE(
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
  if (user.role === "ADMIN") return err("Impossible de supprimer un admin");

  await prisma.user.delete({ where: { id } });

  return ok({ message: "Utilisateur supprimé" });
}

export const dynamic = "force-dynamic";
