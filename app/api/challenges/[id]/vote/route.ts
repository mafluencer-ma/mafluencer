import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, withRateLimit, requireAuth } from "@/lib/api-auth";
import { VoteSchema } from "@/lib/schemas";

// POST /api/challenges/[id]/vote — vote for a submission
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const limited = await withRateLimit(req);
  if (limited) return limited;

  const { user, error } = await requireAuth();
  if (error) return error;

  const { id: challengeId } = await params;

  const challenge = await prisma.challenge.findUnique({ where: { id: challengeId } });
  if (!challenge) return err("Défi introuvable", 404);
  if (challenge.status !== "VOTING" && challenge.status !== "ACTIVE")
    return err("Les votes ne sont pas ouverts pour ce défi");

  const body   = await req.json();
  const parsed = VoteSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? "Données invalides");

  const submission = await prisma.submission.findUnique({
    where: { id: parsed.data.submissionId },
  });
  if (!submission || submission.challengeId !== challengeId)
    return err("Soumission introuvable");
  if (submission.status !== "APPROVED")
    return err("Cette soumission n'est pas approuvée");

  // Can't vote on own submission
  if (submission.creatorId === user.id)
    return err("Tu ne peux pas voter pour ta propre soumission");

  // One vote per user per challenge
  const existingVote = await prisma.vote.findFirst({
    where: {
      voterId:      user.id,
      submission:   { challengeId },
    },
  });
  if (existingVote) return err("Tu as déjà voté pour ce défi");

  const vote = await prisma.vote.create({
    data: {
      submissionId: parsed.data.submissionId,
      voterId:      user.id,
      value:        parsed.data.value,
    },
  });

  return ok({ vote }, 201);
}
