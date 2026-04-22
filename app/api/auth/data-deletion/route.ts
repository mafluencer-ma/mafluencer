// POST /api/auth/data-deletion
// Required by Meta/Instagram — called when a user requests deletion of their data
// via Facebook's "Apps and Websites" settings.
// Must return a { url, confirmation_code } response so the user can track the request.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { signed_request?: string; user_id?: string };
    const instagramUserId = body.user_id;

    // Generate a unique confirmation code for this deletion request
    const confirmationCode = `DEL-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    if (instagramUserId) {
      // Find the user via their Instagram account link
      const account = await prisma.account.findFirst({
        where: { provider: "instagram", providerAccountId: instagramUserId },
        select: { userId: true },
      });

      if (account) {
        // Delete all personal data: account link, creator profile, notifications, votes
        await prisma.$transaction([
          prisma.account.deleteMany({ where: { userId: account.userId, provider: "instagram" } }),
          prisma.creatorProfile.deleteMany({ where: { userId: account.userId } }),
          prisma.notification.deleteMany({ where: { userId: account.userId } }),
          prisma.vote.deleteMany({ where: { voterId: account.userId } }),
        ]);
      }
    }

    const baseUrl = process.env.NEXTAUTH_URL ?? "https://mafluencer.ma";

    // Meta requires this exact response shape
    return NextResponse.json({
      url:               `${baseUrl}/data-deletion?code=${confirmationCode}`,
      confirmation_code: confirmationCode,
    });
  } catch {
    const code = `DEL-ERR-${Date.now()}`;
    const baseUrl = process.env.NEXTAUTH_URL ?? "https://mafluencer.ma";
    return NextResponse.json({
      url:               `${baseUrl}/data-deletion?code=${code}`,
      confirmation_code: code,
    });
  }
}

// GET — human-readable confirmation page linked from the deletion email
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code") ?? "—";
  return new Response(
    `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Suppression de données — Mafluencer</title></head>
    <body style="font-family:sans-serif;max-width:480px;margin:80px auto;color:#334155;text-align:center;">
      <h1 style="font-size:1.25rem;font-weight:700">Demande de suppression reçue</h1>
      <p style="color:#64748b;margin-top:12px">Tes données liées à Instagram ont été supprimées de Mafluencer.</p>
      <p style="font-size:0.75rem;color:#94a3b8;margin-top:24px">Code de confirmation : <strong>${code}</strong></p>
    </body></html>`,
    { headers: { "Content-Type": "text/html" } }
  );
}
