import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, withRateLimit, requireAdmin } from "@/lib/api-auth";
import { awardChallengeParticipation } from "@/lib/scoring";
import { notifySubmissionApproved, notifySubmissionRejected } from "@/lib/notifications";

// GET /api/admin/challenges/[id] — challenge detail with all submissions
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const limited = await withRateLimit(req);
  if (limited) return limited;

  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;

  const challenge = await prisma.challenge.findUnique({
    where: { id },
    include: {
      submissions: {
        include: {
          creator: { select: { id: true, name: true, image: true } },
          votes:   true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!challenge) return err("Défi introuvable", 404);

  return ok({ challenge });
}

// PATCH /api/admin/challenges/[id] — update challenge or approve/reject submission
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const limited = await withRateLimit(req);
  if (limited) return limited;

  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const body = await req.json();

  // If body has submissionId, it's a submission moderation action
  if (body.submissionId) {
    const { submissionId, status, reason } = body as {
      submissionId: string;
      status: "APPROVED" | "REJECTED";
      reason?: string;
    };

    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: { challenge: true },
    });
    if (!submission || submission.challengeId !== id)
      return err("Soumission introuvable");

    await prisma.submission.update({
      where: { id: submissionId },
      data:  { status },
    });

    if (status === "APPROVED") {
      await awardChallengeParticipation(submissionId);
      await notifySubmissionApproved(submission.creatorId, submission.challenge.title, id);
    } else {
      await notifySubmissionRejected(submission.creatorId, submission.challenge.title, reason);
    }

    return ok({ message: `Soumission ${status === "APPROVED" ? "approuvée" : "refusée"}` });
  }

  // Otherwise update the challenge itself
  const challenge = await prisma.challenge.findUnique({ where: { id } });
  if (!challenge) return err("Défi introuvable", 404);

  const updated = await prisma.challenge.update({
    where: { id },
    data:  body,
  });

  return ok({ challenge: updated });
}

// DELETE /api/admin/challenges/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const limited = await withRateLimit(req);
  if (limited) return limited;

  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;

  const challenge = await prisma.challenge.findUnique({ where: { id } });
  if (!challenge) return err("Défi introuvable", 404);

  await prisma.challenge.delete({ where: { id } });

  return ok({ message: "Défi supprimé" });
}
