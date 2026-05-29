import { NextRequest, NextResponse } from "next/server";
import { runMetricsTracking } from "@/lib/track-metrics";

// POST /api/cron/track-metrics
// Manual trigger for metrics tracking (also runs automatically via instrumentation.ts cron).
// Protected by CRON_SECRET header.
export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret") ?? req.headers.get("authorization");
  if (secret !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await runMetricsTracking();
  return NextResponse.json(result);
}

export const dynamic = "force-dynamic";
