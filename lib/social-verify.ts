// Social post verification via oEmbed (no user token needed — works for public posts)
// Instagram: uses CLIENT_ID|CLIENT_SECRET as app token for oEmbed
// TikTok: public oEmbed endpoint, no auth needed

export type VerifyResult =
  | { ok: true; authorName: string; mediaId?: string; mediaType?: string }
  | { ok: false; error: string };

export async function verifyInstagramPost(
  url: string,
  expectedHandle: string,
): Promise<VerifyResult> {
  try {
    const appToken = `${process.env.INSTAGRAM_CLIENT_ID}|${process.env.INSTAGRAM_CLIENT_SECRET}`;
    const oembedUrl =
      `https://graph.facebook.com/v22.0/instagram_oembed` +
      `?url=${encodeURIComponent(url)}&access_token=${appToken}`;

    const res = await fetch(oembedUrl, { next: { revalidate: 0 } });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const msg = (body as { error?: { message?: string } }).error?.message;
      return { ok: false, error: msg ?? "Post Instagram introuvable ou non public" };
    }

    const data = (await res.json()) as { author_name?: string; html?: string };
    if (!data.author_name) return { ok: false, error: "Impossible de lire l'auteur du post" };

    const actual   = data.author_name.toLowerCase().replace(/^@/, "");
    const expected = expectedHandle.toLowerCase().replace(/^@/, "");

    if (actual !== expected) {
      return {
        ok:    false,
        error: `Ce post appartient à @${actual}, pas à @${expected}`,
      };
    }

    return { ok: true, authorName: actual };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Erreur de vérification Instagram" };
  }
}

export async function verifyTikTokPost(
  url: string,
  expectedHandle: string,
): Promise<VerifyResult> {
  try {
    const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`;
    const res = await fetch(oembedUrl, { next: { revalidate: 0 } });

    if (!res.ok) return { ok: false, error: "Vidéo TikTok introuvable ou non publique" };

    const data = (await res.json()) as {
      status_code?: number;
      author_name?: string;
      author_url?: string;
    };

    if (data.status_code && data.status_code !== 10000) {
      return { ok: false, error: "Vidéo TikTok introuvable ou non publique" };
    }

    // author_url is like "https://www.tiktok.com/@username"
    const fromUrl  = data.author_url?.split("@")[1]?.split(/[/?#]/)[0] ?? "";
    const actual   = (fromUrl || data.author_name || "").toLowerCase().replace(/^@/, "");
    const expected = expectedHandle.toLowerCase().replace(/^@/, "");

    if (!actual) return { ok: false, error: "Impossible de lire l'auteur de la vidéo" };

    if (actual !== expected) {
      return {
        ok:    false,
        error: `Cette vidéo appartient à @${actual}, pas à @${expected}`,
      };
    }

    const mediaId = url.match(/\/video\/(\d+)/)?.[1];
    return { ok: true, authorName: actual, mediaId };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Erreur de vérification TikTok" };
  }
}

export async function verifySocialPost(
  platform: "instagram" | "tiktok",
  url: string,
  handle: string,
): Promise<VerifyResult> {
  if (platform === "instagram") return verifyInstagramPost(url, handle);
  return verifyTikTokPost(url, handle);
}
