import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, withRateLimit, requireAdmin } from "@/lib/api-auth";

// PATCH /api/admin/liens-paiement/[id] — update nom, montant, or statut
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const limited = await withRateLimit(req);
  if (limited) return limited;

  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const existing = await prisma.lienPaiement.findUnique({ where: { id } });
  if (!existing) return err("Lien introuvable", 404);

  const body = await req.json();
  const data: { nom?: string; montant?: number; statut?: string } = {};

  if (body.nom !== undefined) {
    if (typeof body.nom !== "string" || body.nom.trim().length === 0)
      return err("Nom invalide");
    data.nom = body.nom.trim();
  }
  if (body.montant !== undefined) {
    if (typeof body.montant !== "number" || body.montant <= 0)
      return err("Montant invalide");
    data.montant = body.montant;
  }
  if (body.statut !== undefined) {
    if (!["ACTIF", "INACTIF", "PAYE"].includes(body.statut))
      return err("Statut invalide");
    data.statut = body.statut;
  }

  const updated = await prisma.lienPaiement.update({ where: { id }, data });

  return ok(updated);
}

// DELETE /api/admin/liens-paiement/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const limited = await withRateLimit(req);
  if (limited) return limited;

  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const existing = await prisma.lienPaiement.findUnique({ where: { id } });
  if (!existing) return err("Lien introuvable", 404);

  await prisma.lienPaiement.delete({ where: { id } });

  return ok({ deleted: true });
}
