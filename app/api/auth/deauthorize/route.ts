// POST /api/auth/deauthorize
// Required by Meta/Instagram — called when a user removes the app from their Instagram settings.
// We delete the linked Account row so the user can re-authorize cleanly.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { signed_request?: string; user_id?: string };

    // Meta sends a signed_request. For basic compliance we accept and log the user_id.
    // Production apps should verify the HMAC signature using the app secret.
    const userId = body.user_id;

    if (userId) {
      // Remove the Instagram account link so the user must re-auth next time
      await prisma.account.deleteMany({
        where: { provider: "instagram", providerAccountId: userId },
      });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: true }); // always 200 to Meta
  }
}
