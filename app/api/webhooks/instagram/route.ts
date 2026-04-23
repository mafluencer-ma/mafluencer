// /api/webhooks/instagram
//
// GET  — Meta hub challenge verification (required to activate the webhook).
//        Meta sends: hub.mode, hub.challenge, hub.verify_token
//        We must echo hub.challenge back as plain text.
//
// POST — Meta webhook event delivery (follows, comments, mentions, etc.)

import { NextRequest, NextResponse } from "next/server";

const VERIFY_TOKEN = "mafluencer_ig_2024";

// ── GET: hub challenge ────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const mode      = req.nextUrl.searchParams.get("hub.mode");
  const challenge = req.nextUrl.searchParams.get("hub.challenge");
  const token     = req.nextUrl.searchParams.get("hub.verify_token");

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    // Respond with the challenge — Meta confirms the webhook is live
    return new Response(challenge ?? "", { status: 200, headers: { "Content-Type": "text/plain" } });
  }

  return new Response("Forbidden", { status: 403 });
}

// ── POST: incoming webhook events ────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      object?: string;
      entry?: Array<{
        id: string;
        time: number;
        changes?: Array<{ field: string; value: unknown }>;
      }>;
    };

    // Only process instagram events
    if (body.object !== "instagram") {
      return NextResponse.json({ received: true });
    }

    // Process each entry (non-blocking — respond immediately to Meta)
    for (const entry of body.entry ?? []) {
      for (const change of entry.changes ?? []) {
        console.log("[Instagram webhook]", change.field, change.value);
        // TODO: handle specific events:
        // - "mentions"    → creator was mentioned in a post
        // - "comments"    → comment on a creator's media
        // - "live_videos" → live stream events
      }
    }

    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ received: true });
  }
}
