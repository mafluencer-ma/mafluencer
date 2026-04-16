import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, withRateLimit, requireRole } from "@/lib/api-auth";
import { SubmitChallengeSchema } from "@/lib/schemas";

// POST /api/challenges/[id]/submit — creator submits a video
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const limited = await withRateLimit(req);
  if (limited) return limited;

  const { user, error } = await requireRole("CREATOR");
  if (error) return error;

  const { id: challengeId } = await params;

  const challenge = await prisma.challenge.findUnique({ where: { id: challengeId } });
  if (!challenge) return err("Défi introuvable", 404);
  if (challenge.status !== "ACTIVE") return err("Ce défi n'accepte plus de soumissions");

  // One submission per challenge per creator
  const existing = await prisma.submission.findFirst({
    where: { challengeId, creatorId: user.id },
  });
  if (existing) return err("Tu as déjà soumis une vidéo pour ce défi");

  const body   = await req.json();
  const parsed = SubmitChallengeSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? "Données invalides");

  const submission = await prisma.submission.create({
    data: {
      challengeId,
      creatorId:   user.id,
      videoUrl:    parsed.data.videoUrl,
      thumbnailUrl:parsed.data.thumbnailUrl,
      caption:     parsed.data.caption,
      status:      "PENDING",
    },
  });

  return ok({ submission }, 201);
}
