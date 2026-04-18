import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const baseUrl = process.env.NEXTAUTH_URL ?? "https://mafluencer.ma";
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(`${baseUrl}/auth/signin?error=InvalidToken`);
  }

  const user = await prisma.user.findFirst({
    where:  { verifyToken: token },
    select: { id: true, email: true, name: true, role: true, verifyTokenExpiry: true, emailVerified: true },
  });

  if (!user) {
    return NextResponse.redirect(`${baseUrl}/auth/signin?error=InvalidToken`);
  }

  if (user.verifyTokenExpiry && user.verifyTokenExpiry < new Date()) {
    return NextResponse.redirect(`${baseUrl}/auth/signin?error=TokenExpired`);
  }

  // Mark email as verified + clear token
  await prisma.user.update({
    where: { id: user.id },
    data:  { emailVerified: new Date(), verifyToken: null, verifyTokenExpiry: null },
  });

  // Create role-specific profile if not exists
  if (user.role === "BRAND") {
    const existing = await prisma.brandProfile.findUnique({ where: { userId: user.id } });
    if (!existing) {
      await prisma.brandProfile.create({
        data: { userId: user.id, companyName: user.name ?? "Ma Marque", balance: 0 },
      });
    }
  } else {
    const existing = await prisma.creatorProfile.findUnique({ where: { userId: user.id } });
    if (!existing) {
      await prisma.creatorProfile.create({
        data: { userId: user.id, niches: [], score: 0, level: "Rookie" },
      });
    }
  }

  // Send welcome email (non-blocking)
  try {
    const resend     = new Resend(process.env.RESEND_API_KEY!);
    const firstName  = user.name ? user.name.split(" ")[0] : "Creator";
    const isBrand    = user.role === "BRAND";
    const dashUrl    = isBrand ? `${baseUrl}/dashboard/brand` : `${baseUrl}/dashboard/creator`;

    await resend.emails.send({
      from:    "Mafluencer <noreply@mafluencer.ma>",
      to:      [user.email],
      subject: "Bienvenue sur Mafluencer",
      html: `
        <div style="font-family:Inter,sans-serif;background:#0F172A;color:#E2E8F0;padding:40px;max-width:520px;margin:0 auto;border-radius:16px;">
          <div style="text-align:center;margin-bottom:32px;">
            <h1 style="font-size:24px;font-weight:700;margin:0;background:linear-gradient(135deg,#6366F1,#EC4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">
              Mafluencer
            </h1>
          </div>
          <h2 style="font-size:20px;font-weight:700;margin-bottom:8px;color:#E2E8F0;">
            Bienvenue sur Mafluencer, ${firstName} !
          </h2>
          <p style="color:#94A3B8;font-size:14px;margin-bottom:24px;line-height:1.6;">
            ${isBrand
              ? "Ton compte Brand a été créé avec succès. Tu peux maintenant découvrir les meilleurs creators du Maroc, lancer des défis sponsorisés et créer des missions ciblées."
              : "Ton compte Creator a été créé avec succès. Tu peux maintenant relever des défis créatifs, construire ton Mafluencer Score et recevoir des missions payantes des meilleures marques du Maroc."
            }
          </p>
          <div style="background:#1E293B;border-radius:12px;padding:20px;margin-bottom:24px;">
            <p style="font-size:13px;font-weight:600;color:#E2E8F0;margin:0 0 12px 0;">Ce qui t'attend :</p>
            <ul style="list-style:none;padding:0;margin:0;color:#94A3B8;font-size:13px;line-height:2;">
              ${isBrand ? `
              <li>Découverte des meilleurs creators</li>
              <li>Défis sponsorisés personnalisés</li>
              <li>Missions ciblées par niche</li>
              <li>Mesure du ROI en temps réel</li>
              ` : `
              <li>Défis créatifs hebdomadaires</li>
              <li>Score public (Rookie - Legend)</li>
              <li>Missions payantes des brands</li>
              <li>Leaderboard national des creators</li>
              `}
            </ul>
          </div>
          <div style="text-align:center;margin-bottom:32px;">
            <a href="${dashUrl}"
               style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#6366F1,#EC4899);color:#fff;text-decoration:none;border-radius:12px;font-weight:600;font-size:15px;">
              Accéder à mon dashboard
            </a>
          </div>
          <p style="color:#475569;font-size:12px;text-align:center;">L'équipe Mafluencer — Maroc</p>
        </div>
      `,
    });
  } catch (err) {
    console.warn("[verify] Welcome email failed (non-fatal):", err);
  }

  // Redirect to signin with verified flag so the page shows success message
  return NextResponse.redirect(`${baseUrl}/auth/signin?verified=true`);
}
