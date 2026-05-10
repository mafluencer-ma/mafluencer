import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, withRateLimit, requireAdmin } from "@/lib/api-auth";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://mafluencer.ma";

// GET /api/admin/liens-paiement — list all payment links
export async function GET(req: NextRequest) {
  const limited = await withRateLimit(req);
  if (limited) return limited;

  const { error } = await requireAdmin();
  if (error) return error;

  const liens = await prisma.lienPaiement.findMany({
    orderBy: { createdAt: "desc" },
  });

  return ok(
    liens.map((l) => ({
      ...l,
      checkoutUrl: `${APP_URL}/paiement/${l.id}`,
    }))
  );
}

// POST /api/admin/liens-paiement — create a payment link
export async function POST(req: NextRequest) {
  const limited = await withRateLimit(req);
  if (limited) return limited;

  const { error } = await requireAdmin();
  if (error) return error;

  const body = await req.json();
  const { nom, montant } = body;

  if (!nom || typeof nom !== "string" || nom.trim().length === 0)
    return err("Le nom est requis");
  if (!montant || typeof montant !== "number" || montant <= 0)
    return err("Le montant doit être un nombre positif");

  const lien = await prisma.lienPaiement.create({
    data: { nom: nom.trim(), montant },
  });

  return ok({ ...lien, checkoutUrl: `${APP_URL}/paiement/${lien.id}` }, 201);
}
