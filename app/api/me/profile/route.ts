import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, withRateLimit, requireAuth } from "@/lib/api-auth";
import { UpdateCreatorProfileSchema } from "@/lib/schemas";

// PATCH /api/me/profile — update creator profile
export async function PATCH(req: NextRequest) {
  const limited = await withRateLimit(req);
  if (limited) return limited;

  const { user, error } = await requireAuth();
  if (error) return error;

  if (user.role !== "CREATOR") return err("Seuls les creators peuvent modifier ce profil", 403);

  try {
    const body   = await req.json();
    const parsed = UpdateCreatorProfileSchema.safeParse(body);
    if (!parsed.success) return err(parsed.error.issues[0]?.message ?? "Données invalides");

    const data = {
      ...(parsed.data.bio             !== undefined ? { bio:             parsed.data.bio }             : {}),
      ...(parsed.data.city            !== undefined ? { city:            parsed.data.city }            : {}),
      ...(parsed.data.niches          !== undefined ? { niches:          parsed.data.niches }          : {}),
      ...(parsed.data.tiktokHandle    !== undefined ? { tiktokHandle:    parsed.data.tiktokHandle }    : {}),
      ...(parsed.data.instagramHandle !== undefined ? { instagramHandle: parsed.data.instagramHandle } : {}),
      ...(parsed.data.pricePerPost    !== undefined ? { pricePerPost:    parsed.data.pricePerPost }    : {}),
      ...(parsed.data.pricePerStory   !== undefined ? { pricePerStory:   parsed.data.pricePerStory }   : {}),
      ...(parsed.data.pricePerVideo   !== undefined ? { pricePerVideo:   parsed.data.pricePerVideo }   : {}),
    };

    const profile = await prisma.creatorProfile.upsert({
      where:  { userId: user.id },
      create: { userId: user.id, ...data },
      update: data,
    });

    return ok({ profile });
  } catch (e) {
    console.error(e);
    return err("Erreur serveur", 500);
  }
}

export const dynamic = "force-dynamic";
