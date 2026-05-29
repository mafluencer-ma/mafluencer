import { NextRequest }     from "next/server";
import { prisma }          from "@/lib/prisma";
import { ok, err, withRateLimit, requireRole } from "@/lib/api-auth";
import { verifySocialPost } from "@/lib/social-verify";

// POST /api/challenges/[id]/verify-post
// Re-run ownership verification on an existing submission (e.g. if it was FAILED or PENDING).
// Body: { submissionId }
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const limited = await withRateLimit(req);
  if (limited) return limited;

  const { user, error } = await requireRole("CREATOR");
  if (error) return error;

  const { id: challengeId } = await params;
  const { submissionId }    = await req.json() as { submissionId?: string };
  if (!submissionId) return err("submissionId requis");

  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: {
      creator:   { select: { id: true } },
      challenge: { select: { id: true } },
    },
  });

  if (!submission)                         return err("Soumission introuvable", 404);
  if (submission.creator.id !== user.id)   return err("Accès refusé", 403);
  if (submission.challenge.id !== challengeId) return err("Soumission incorrecte", 400);
  if (!submission.postUrl || !submission.platform) return err("URL ou plateforme manquante");

  const profile = await prisma.creatorProfile.findUnique({
    where:  { userId: user.id },
    select: { instagramHandle: true, tiktokHandle: true },
  });

  const handle =
    submission.platform === "instagram"
      ? profile?.instagramHandle
      : profile?.tiktokHandle;

  if (!handle) return err("Handle social introuvable — complète ton profil");

  const result = await verifySocialPost(
    submission.platform as "instagram" | "tiktok",
    submission.postUrl,
    handle,
  );

  await prisma.submission.update({
    where: { id: submissionId },
    data: {
      verificationStatus: result.ok ? "VERIFIED" : "FAILED",
      verifiedAt:         result.ok ? new Date() : null,
      externalPostId:     result.ok ? (result.mediaId ?? submission.externalPostId) : submission.externalPostId,
      status:             result.ok ? "APPROVED" : "PENDING",
    },
  });

  return ok({
    ok:         result.ok,
    authorName: result.ok ? result.authorName : undefined,
    error:      !result.ok ? result.error : undefined,
  });
}

export const dynamic = "force-dynamic";
