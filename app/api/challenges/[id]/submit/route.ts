import { NextRequest } from "next/server";
import { prisma }      from "@/lib/prisma";
import { ok, err, withRateLimit, requireRole } from "@/lib/api-auth";
import { SubmitChallengeSchema } from "@/lib/schemas";
import { verifySocialPost }      from "@/lib/social-verify";

// POST /api/challenges/[id]/submit
// Creator submits a social post URL (+ optional R2 upload URL) for a challenge.
// Verification against the creator's saved handle runs immediately.
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
  if (!challenge)                          return err("Défi introuvable", 404);
  if (challenge.status !== "ACTIVE")       return err("Ce défi n'accepte plus de soumissions");

  const body   = await req.json();
  const parsed = SubmitChallengeSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? "Données invalides");

  const { platform, postUrl, uploadedFileUrl, caption } = parsed.data;

  // One submission per platform per creator per challenge
  const existing = await prisma.submission.findFirst({
    where: { challengeId, creatorId: user.id, platform },
  });
  if (existing) return err(`Tu as déjà soumis une participation ${platform === "instagram" ? "Instagram" : "TikTok"} pour ce défi`);

  // Fetch creator profile to get the social handle for verification
  const profile = await prisma.creatorProfile.findUnique({
    where:  { userId: user.id },
    select: { instagramHandle: true, tiktokHandle: true },
  });
  if (!profile) return err("Profil créateur introuvable", 404);

  const handle = platform === "instagram" ? profile.instagramHandle : profile.tiktokHandle;
  if (!handle) {
    return err(
      `Connecte ton compte ${platform === "instagram" ? "Instagram" : "TikTok"} dans ton profil avant de soumettre`,
      422,
    );
  }

  // Verify ownership & publication via oEmbed
  const verification = await verifySocialPost(platform, postUrl, handle);

  const submission = await prisma.submission.create({
    data: {
      challengeId,
      creatorId:         user.id,
      platform,
      postUrl,
      uploadedFileUrl:   uploadedFileUrl ?? null,
      caption:           caption ?? null,
      externalPostId:    verification.ok ? (verification.mediaId ?? null) : null,
      verificationStatus: verification.ok ? "VERIFIED" : "FAILED",
      verifiedAt:         verification.ok ? new Date() : null,
      // auto-approve if verified, otherwise pending manual review
      status:             verification.ok ? "APPROVED" : "PENDING",
      // legacy field
      videoUrl: postUrl,
    },
  });

  return ok(
    {
      submission: {
        id:                 submission.id,
        verificationStatus: submission.verificationStatus,
        status:             submission.status,
      },
      verification: {
        ok:          verification.ok,
        authorName:  verification.ok ? verification.authorName : undefined,
        error:       !verification.ok ? verification.error : undefined,
      },
    },
    201,
  );
}

export const dynamic = "force-dynamic";
