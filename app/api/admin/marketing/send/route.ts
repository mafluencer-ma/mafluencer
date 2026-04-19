import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, withRateLimit, requireAdmin } from "@/lib/api-auth";
import { Resend } from "resend";

export const dynamic = "force-dynamic";

type SendBody = {
  type:     "email" | "whatsapp";
  target:   "all" | "creators" | "brands" | "specific";
  message:  string;
  subject?: string;
  email?:   string; // for specific target
};

// POST /api/admin/marketing/send
export async function POST(req: NextRequest) {
  const limited = await withRateLimit(req);
  if (limited) return limited;

  const { error } = await requireAdmin();
  if (error) return error;

  const body = await req.json() as SendBody;
  const { type, target, message, subject, email } = body;

  if (!type || !target || !message?.trim()) {
    return err("Champs requis : type, target, message");
  }
  if (type === "email" && !subject?.trim()) {
    return err("Sujet requis pour les emails");
  }
  if (target === "specific" && !email?.trim()) {
    return err("Email requis pour la cible 'specific'");
  }

  // Resolve target users
  let users: Array<{ email: string; name: string | null }> = [];

  if (target === "specific") {
    users = [{ email: email!, name: null }];
  } else {
    const where =
      target === "creators" ? { role: "CREATOR" as const } :
      target === "brands"   ? { role: "BRAND"   as const } :
      {};

    users = await prisma.user.findMany({
      where,
      select: { email: true, name: true },
    });
  }

  if (users.length === 0) {
    return err("Aucun destinataire trouvé");
  }

  // ── Email via Resend ──────────────────────────────────────────────────────
  if (type === "email") {
    const resend = new Resend(process.env.RESEND_API_KEY!);
    const sent: string[] = [];
    const failed: string[] = [];

    // Resend batch: max 100 per call
    const chunks: Array<typeof users> = [];
    for (let i = 0; i < users.length; i += 50) chunks.push(users.slice(i, i + 50));

    for (const chunk of chunks) {
      await Promise.allSettled(
        chunk.map(async (u) => {
          const firstName = u.name ? u.name.split(" ")[0] : "Utilisateur";
          try {
            const { error: sendErr } = await resend.emails.send({
              from:    "Mafluencer <noreply@mafluencer.ma>",
              to:      [u.email],
              subject: subject!,
              html: `
                <div style="font-family:Inter,sans-serif;background:#0F172A;color:#E2E8F0;padding:40px;max-width:520px;margin:0 auto;border-radius:16px;">
                  <div style="text-align:center;margin-bottom:24px;">
                    <h1 style="font-size:22px;font-weight:700;margin:0;background:linear-gradient(135deg,#6366F1,#EC4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">
                      Mafluencer
                    </h1>
                  </div>
                  <p style="color:#94A3B8;font-size:13px;margin-bottom:8px;">Bonjour ${firstName},</p>
                  <div style="color:#E2E8F0;font-size:14px;line-height:1.7;white-space:pre-wrap;">${message}</div>
                  <p style="color:#475569;font-size:12px;text-align:center;margin-top:32px;">L'équipe Mafluencer — Maroc</p>
                </div>
              `,
            });
            if (sendErr) failed.push(u.email);
            else sent.push(u.email);
          } catch {
            failed.push(u.email);
          }
        })
      );
    }

    return ok({
      type:   "email",
      total:  users.length,
      sent:   sent.length,
      failed: failed.length,
      failedEmails: failed.slice(0, 10),
    });
  }

  // ── WhatsApp via Meta Business API ────────────────────────────────────────
  if (type === "whatsapp") {
    const token   = process.env.WHATSAPP_TOKEN;
    const phoneId = process.env.WHATSAPP_PHONE_ID;

    if (!token || !phoneId) {
      return err("WhatsApp non configuré (WHATSAPP_TOKEN et WHATSAPP_PHONE_ID requis)");
    }

    // WhatsApp requires phone numbers, not emails — users need a phone field
    // For now return a not-implemented message with guidance
    return err("WhatsApp : les utilisateurs doivent avoir un numéro de téléphone enregistré. Ajoutez un champ phone à UserProfile pour activer cette fonctionnalité.");
  }

  return err("Type non supporté");
}
