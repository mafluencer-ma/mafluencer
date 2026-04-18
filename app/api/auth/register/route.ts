import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { Resend } from "resend";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json() as { name?: string; email?: string; password?: string; role?: string };
  const { name, email, password, role } = body;

  if (!name || !email || !password || !role) {
    return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
  }
  if (role !== "BRAND" && role !== "CREATOR") {
    return NextResponse.json({ error: "Rôle invalide" }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Le mot de passe doit contenir au moins 8 caractères" }, { status: 400 });
  }

  // Check if email already registered + verified
  const existing = await prisma.user.findUnique({
    where:  { email },
    select: { id: true, emailVerified: true },
  });

  if (existing?.emailVerified) {
    return NextResponse.json({ error: "email_taken" }, { status: 409 });
  }

  const hash   = await bcrypt.hash(password, 12);
  const token  = crypto.randomBytes(32).toString("hex");
  const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

  if (existing) {
    // Unverified account — update and resend
    await prisma.user.update({
      where: { id: existing.id },
      data:  { name, password: hash, role: role as "CREATOR" | "BRAND", verifyToken: token, verifyTokenExpiry: expiry },
    });
  } else {
    await prisma.user.create({
      data: { name, email, password: hash, role: role as "CREATOR" | "BRAND", verifyToken: token, verifyTokenExpiry: expiry },
    });
  }

  // Send verification email
  const baseUrl  = process.env.NEXTAUTH_URL ?? "https://mafluencer.ma";
  const verifyUrl = `${baseUrl}/api/auth/verify?token=${token}`;
  const firstName = name.split(" ")[0];

  try {
    const resend = new Resend(process.env.RESEND_API_KEY!);
    await resend.emails.send({
      from:    "Mafluencer <noreply@mafluencer.ma>",
      to:      [email],
      subject: "Vérifie ton email Mafluencer",
      html: `
        <div style="font-family:Inter,sans-serif;background:#0F172A;color:#E2E8F0;padding:40px;max-width:520px;margin:0 auto;border-radius:16px;">
          <div style="text-align:center;margin-bottom:32px;">
            <h1 style="font-size:24px;font-weight:700;margin:0;background:linear-gradient(135deg,#6366F1,#EC4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">
              Mafluencer
            </h1>
          </div>
          <h2 style="font-size:20px;font-weight:700;margin-bottom:8px;color:#E2E8F0;">
            Salut ${firstName}, vérifie ton email
          </h2>
          <p style="color:#94A3B8;font-size:14px;margin-bottom:24px;line-height:1.6;">
            Tu es à un clic de rejoindre la communauté Mafluencer. Clique sur le bouton ci-dessous pour confirmer ton adresse email.
            Ce lien expire dans 24 heures.
          </p>
          <div style="text-align:center;margin-bottom:32px;">
            <a href="${verifyUrl}"
               style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#6366F1,#EC4899);color:#fff;text-decoration:none;border-radius:12px;font-weight:600;font-size:15px;">
              Vérifier mon email
            </a>
          </div>
          <div style="background:#1E293B;border-radius:12px;padding:16px;margin-bottom:24px;">
            <p style="font-size:12px;color:#64748B;margin:0;">
              Si le bouton ne fonctionne pas, copie ce lien dans ton navigateur :<br/>
              <span style="color:#6366F1;word-break:break-all;">${verifyUrl}</span>
            </p>
          </div>
          <p style="color:#475569;font-size:12px;text-align:center;">
            Si tu n'as pas créé de compte, ignore cet email.
          </p>
        </div>
      `,
    });
  } catch (err) {
    console.error("[register] Failed to send verification email:", err);
    // Don't fail the registration — user can request resend
  }

  return NextResponse.json({ ok: true });
}
