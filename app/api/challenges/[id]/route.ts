import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, withRateLimit, requireAuth } from "@/lib/api-auth";
import { UpdateChallengeSchema } from "@/lib/schemas";
import { finalizeChallenge } from "@/lib/scoring";

// GET /api/challenges/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const limited = await withRateLimit(req);
  if (limited) return limited;

  const { id } = await params;

  const challenge = await prisma.challenge.findUnique({
    where: { id },
    include: {
      submissions: {
        where:   { status: "APPROVED" },
        include: {
          creator: { select: { id: true, name: true, image: true } },
          votes:   true,
          _count:  { select: { votes: true } },
        },
        orderBy: { score: "desc" },
      },
      brand: { select: { companyName: true, logo: true } },
    },
  });

  if (!challenge) return err("Défi introuvable", 404);

  return ok({
    ...challenge,
    submissions: challenge.submissions.map((s) => ({
      id:          s.id,
      videoUrl:    s.videoUrl,
      thumbnailUrl:s.thumbnailUrl,
      caption:     s.caption,
      score:       s.score,
      rank:        s.rank,
      likes:       s.likes,
      views:       s.views,
      voteCount:   s.votes.reduce((a, v) => a + v.value, 0),
      creator: s.creator,
      createdAt: s.createdAt,
    })),
  });
}

// PATCH /api/challenges/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const limited = await withRateLimit(req);
  if (limited) return limited;

  const { user, error } = await requireAuth();
  if (error) return error;
  if (user.role !== "ADMIN" && user.role !== "BRAND") return err("Accès refusé", 403);

  const { id } = await params;
  const body   = await req.json();
  const parsed = UpdateChallengeSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? "Données invalides");

  const challenge = await prisma.challenge.findUnique({ where: { id } });
  if (!challenge) return err("Défi introuvable", 404);

  // Brand can only edit their own challenges
  if (user.role === "BRAND" && challenge.brandId !== user.id)
    return err("Accès refusé", 403);

  const wasCompleted = challenge.status !== "COMPLETED" && parsed.data.status === "COMPLETED";

  const updated = await prisma.challenge.update({
    where: { id },
    data:  parsed.data,
  });

  // Run finalization scoring when status changes to COMPLETED
  if (wasCompleted) {
    await finalizeChallenge(id);
  }

  return ok({ challenge: updated });
}

// DELETE /api/challenges/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const limited = await withRateLimit(req);
  if (limited) return limited;

  const { user, error } = await requireAuth();
  if (error) return error;
  if (user.role !== "ADMIN") return err("Accès refusé", 403);

  const { id } = await params;
  const challenge = await prisma.challenge.findUnique({ where: { id } });
  if (!challenge) return err("Défi introuvable", 404);

  await prisma.challenge.delete({ where: { id } });

  return ok({ message: "Défi supprimé" });
}
