import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, withRateLimit, requireAdmin } from "@/lib/api-auth";
import { Resend } from "resend";

export const dynamic = "force-dynamic";

type SendBody = {
  type:     "email";
  target:   "all" | "creators" | "brands" | "specific";
  message:  string;
  subject:  string;
  email?:   string; // for specific target
};

// GET /api/admin/marketing/send — last 10 send logs
export async function GET(req: NextRequest) {
  const limited = await withRateLimit(req);
  if (limited) return limited;

  const { error } = await requireAdmin();
  if (error) return error;

  // We store marketing send logs as SYSTEM notifications on the admin user
  const logs = await prisma.notification.findMany({
    where:   { type: "MARKETING_SEND" },
    orderBy: { createdAt: "desc" },
    take:    10,
  });

  return ok({ logs });
}

// POST /api/admin/marketing/send
export async function POST(req: NextRequest) {
  const limited = await withRateLimit(req);
  if (limited) return limited;

  const { user, error } = await requireAdmin();
  if (error) return error;

  const body = await req.json() as SendBody;
  const { target, message, subject, email } = body;

  if (!target || !message?.trim() || !subject?.trim()) {
    return err("Champs requis : target, subject, message");
  }
  if (target === "specific" && !email?.trim()) {
    return err("Email requis pour la cible 'specific'");
  }

  // Resolve target users
  let recipients: Array<{ email: string; name: string | null }> = [];

  if (target === "specific") {
    recipients = [{ email: email!, name: null }];
  } else {
    const where =
      target === "creators" ? { role: "CREATOR" as const } :
      target === "brands"   ? { role: "BRAND"   as const } :
      {};

    recipients = await prisma.user.findMany({
      where,
      select: { email: true, name: true },
    });
  }

  if (recipients.length === 0) {
    return err("Aucun destinataire trouvé");
  }

  const resend = new Resend(process.env.RESEND_API_KEY!);
  const sent:   string[] = [];
  const failed: string[] = [];

  // Send in batches of 10
  for (let i = 0; i < recipients.length; i += 10) {
    const batch = recipients.slice(i, i + 10);
    await Promise.allSettled(
      batch.map(async (u) => {
        const firstName = u.name ? u.name.split(" ")[0] : "Utilisateur";
        try {
          const { error: sendErr } = await resend.emails.send({
            from:    "Mafluencer <noreply@mafluencer.ma>",
            to:      [u.email],
            subject,
            html: `
              <div style="font-family:Inter,sans-serif;background:#0F172A;color:#E2E8F0;padding:40px;max-width:520px;margin:0 auto;border-radius:16px;">
                <div style="text-align:center;margin-bottom:24px;">
                  <h1 style="font-size:22px;font-weight:700;margin:0;background:linear-gradient(135deg,#6366F1,#EC4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">
                    Mafluencer
                  </h1>
                </div>
                <p style="color:#94A3B8;font-size:13px;margin-bottom:12px;">Bonjour ${firstName},</p>
                <div style="color:#E2E8F0;font-size:14px;line-height:1.8;white-space:pre-wrap;">${message}</div>
                <p style="color:#475569;font-size:12px;text-align:center;margin-top:32px;">L'équipe Mafluencer — Maroc</p>
              </div>
            `,
          });
          if (sendErr) failed.push(u.email);
          else         sent.push(u.email);
        } catch {
          failed.push(u.email);
        }
      })
    );
  }

  // Persist send log as a MARKETING_SEND notification on the admin user
  const targetLabel =
    target === "all"      ? "Tous" :
    target === "creators" ? "Creators" :
    target === "brands"   ? "Brands" :
    email ?? "Spécifique";

  await prisma.notification.create({
    data: {
      userId:  user.id,
      type:    "MARKETING_SEND",
      title:   subject,
      message: JSON.stringify({
        target:       targetLabel,
        total:        recipients.length,
        sent:         sent.length,
        failed:       failed.length,
        failedEmails: failed.slice(0, 5),
      }),
      read:    true,
    },
  });

  return ok({
    total:        recipients.length,
    sent:         sent.length,
    failed:       failed.length,
    failedEmails: failed.slice(0, 10),
  });
}
