import { NextRequest } from "next/server";
import { ok, err, withRateLimit, requireAuth } from "@/lib/api-auth";
import { getPresignedUploadUrl, getPublicUrl, buildKey } from "@/lib/r2";
import { UploadQuerySchema } from "@/lib/schemas";

// GET /api/upload — returns a presigned PUT URL for direct R2 upload
export async function GET(req: NextRequest) {
  const limited = await withRateLimit(req, "auth");
  if (limited) return limited;

  const { user, error } = await requireAuth();
  if (error) return error;

  const { searchParams } = req.nextUrl;
  const parsed = UploadQuerySchema.safeParse(Object.fromEntries(searchParams));
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? "Paramètres invalides");

  const { fileName, contentType, folder } = parsed.data;

  const key       = buildKey(folder, user.id, fileName);
  const uploadUrl = await getPresignedUploadUrl(key, contentType);
  const publicUrl = getPublicUrl(key);

  return ok({ uploadUrl, publicUrl, key });
}

export const dynamic = 'force-dynamic'
