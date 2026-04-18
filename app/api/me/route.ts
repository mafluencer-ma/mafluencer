import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, withRateLimit, requireAuth } from "@/lib/api-auth";

// GET /api/me — current user profile + profiles
export async function GET(req: NextRequest) {
  const limited = await withRateLimit(req);
  if (limited) return limited;

  const { user, error } = await requireAuth();
  if (error) return error;

  try {
    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        creatorProfile: true,
        brandProfile: true,
      },
    });
    if (!fullUser) return err("Utilisateur introuvable", 404);

    return ok({
      id:             fullUser.id,
      name:           fullUser.name,
      email:          fullUser.email,
      role:           fullUser.role,
      image:          fullUser.image,
      creatorProfile: fullUser.creatorProfile,
      brandProfile:   fullUser.brandProfile,
    });
  } catch (e) {
    console.error(e);
    return err("Erreur serveur", 500);
  }
}

export const dynamic = "force-dynamic";
