import { z }            from "zod";
import { NextRequest }   from "next/server";
import { prisma }        from "@/lib/prisma";
import { ok, err, withRateLimit, requireRole } from "@/lib/api-auth";
import { verifySocialPost } from "@/lib/social-verify";

const VerifyUrlSchema = z.object({
  platform: z.enum(["instagram", "tiktok"]),
  postUrl:  z.string().min(1, "URL requise"),
});

// POST /api/challenges/[id]/verify-url
// Verify that a social post URL belongs to the authenticated creator.
// Does NOT create a submission — purely a read/check operation.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const limited = await withRateLimit(req);
  if (limited) return limited;

  const { user, error } = await requireRole("CREATOR");
  if (error) return error;

  await params; // resolve params (challengeId not needed for verify-only)

  const body   = await req.json();
  const parsed = VerifyUrlSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? "Données invalides");

  const { platform, postUrl } = parsed.data;

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

  const result = await verifySocialPost(platform, postUrl, handle);

  return ok({
    ok:         result.ok,
    authorName: result.ok ? result.authorName : undefined,
    error:      !result.ok ? result.error     : undefined,
  });
}

export const dynamic = "force-dynamic";
