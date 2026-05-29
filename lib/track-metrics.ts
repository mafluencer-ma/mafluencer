import { prisma } from "@/lib/prisma";

type SubmissionWithTokens = {
  id: string;
  platform: string | null;
  postUrl: string | null;
  externalPostId: string | null;
  creator: { socialTokens: Array<{ platform: string; accessToken: string }> };
};

export async function runMetricsTracking(): Promise<{ tracked: number; failed: number; total: number }> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  const submissions = await prisma.submission.findMany({
    where: {
      status: "APPROVED",
      verificationStatus: "VERIFIED",
      OR: [
        { lastTrackedAt: null },
        { lastTrackedAt: { lt: oneHourAgo } },
      ],
    },
    include: {
      creator: { include: { socialTokens: true } },
    },
    take: 100,
  });

  const results = await Promise.allSettled(
    submissions.map((sub) => trackOne(sub as SubmissionWithTokens))
  );

  return {
    tracked: results.filter((r) => r.status === "fulfilled").length,
    failed:  results.filter((r) => r.status === "rejected").length,
    total:   submissions.length,
  };
}

async function trackOne(sub: SubmissionWithTokens) {
  if (!sub.platform || !sub.postUrl) return;

  const token = sub.creator.socialTokens.find((t) => t.platform === sub.platform);
  if (!token) return;

  let metrics: { views: number; likes: number; comments: number; shares: number; saves: number } | null = null;

  if (sub.platform === "instagram") {
    metrics = await fetchInstagramMetrics(sub.externalPostId ?? sub.postUrl, token.accessToken);
  } else if (sub.platform === "tiktok") {
    metrics = await fetchTikTokMetrics(sub.externalPostId ?? sub.postUrl, token.accessToken);
  }

  if (!metrics) return;

  await prisma.$transaction([
    prisma.submissionMetric.create({ data: { submissionId: sub.id, ...metrics } }),
    prisma.submission.update({
      where: { id: sub.id },
      data: { ...metrics, lastTrackedAt: new Date() },
    }),
  ]);
}

async function fetchInstagramMetrics(mediaIdOrUrl: string, accessToken: string) {
  try {
    if (mediaIdOrUrl.startsWith("http")) return null;
    const fields = "like_count,comments_count,saved_count,impressions,reach";
    const res = await fetch(
      `https://graph.instagram.com/v22.0/${mediaIdOrUrl}?fields=${fields}&access_token=${accessToken}`,
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    const data = await res.json() as Record<string, number>;
    return {
      views:    data.impressions ?? data.reach ?? 0,
      likes:    data.like_count   ?? 0,
      comments: data.comments_count ?? 0,
      shares:   0,
      saves:    data.saved_count ?? 0,
    };
  } catch { return null; }
}

async function fetchTikTokMetrics(videoIdOrUrl: string, accessToken: string) {
  try {
    let videoId = videoIdOrUrl;
    if (videoIdOrUrl.startsWith("http")) {
      const match = videoIdOrUrl.match(/\/video\/(\d+)/);
      if (!match) return null;
      videoId = match[1];
    }
    const res = await fetch("https://open.tiktokapis.com/v2/video/query/", {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        filters: { video_ids: [videoId] },
        fields:  ["view_count", "like_count", "comment_count", "share_count"],
      }),
    });
    if (!res.ok) return null;
    const payload = await res.json() as { data?: { videos?: Array<Record<string, number>> } };
    const video   = payload.data?.videos?.[0];
    if (!video) return null;
    return {
      views:    video.view_count    ?? 0,
      likes:    video.like_count    ?? 0,
      comments: video.comment_count ?? 0,
      shares:   video.share_count   ?? 0,
      saves:    0,
    };
  } catch { return null; }
}

export function scheduleMetricsTracking() {
  // Lazy-import node-cron so this file can be imported in any context;
  // the actual scheduling only runs when called from instrumentation.ts (Node.js runtime).
  import("node-cron").then(({ default: cron }) => {
    cron.schedule("0 * * * *", async () => {
      try {
        const result = await runMetricsTracking();
        console.log(`[cron] metrics tracked: ${result.tracked}/${result.total}, failed: ${result.failed}`);
      } catch (err) {
        console.error("[cron] metrics tracking error:", err);
      }
    });
    console.log("[cron] hourly metrics tracking scheduled");
  }).catch((err) => console.error("[cron] failed to load node-cron:", err));
}
