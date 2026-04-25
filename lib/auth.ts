// lib/auth.ts — Node.js runtime only (uses pg/prisma)
// Extends auth.config.ts with PrismaAdapter + full providers + DB callbacks.

import NextAuth from "next-auth";
import type { OAuthConfig, OAuthUserConfig } from "next-auth/providers";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/auth.config";
import bcrypt from "bcryptjs";

// ── Custom TikTok provider ────────────────────────────────────────────────────
function TikTok(options: OAuthUserConfig<Record<string, unknown>>): OAuthConfig<Record<string, unknown>> {
  return {
    id:   "tiktok",
    name: "TikTok",
    type: "oauth",
    authorization: {
      url:    "https://www.tiktok.com/v2/auth/authorize",
      params: {
        client_key:    options.clientId,
        response_type: "code",
        scope:         "user.info.basic,user.info.profile,user.info.stats",
      },
    },
    token: {
      url: "https://open.tiktokapis.com/v2/oauth/token/",
      async request({ params, provider }: { params: Record<string, unknown>; provider: { clientId?: string; clientSecret?: string; callbackUrl?: string } }) {
        const res = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
          method:  "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            client_key:    provider.clientId!,
            client_secret: provider.clientSecret!,
            code:          params.code as string,
            grant_type:    "authorization_code",
            redirect_uri:  provider.callbackUrl!,
          }),
        });
        const data = await res.json();
        return { tokens: data };
      },
    },
    userinfo: {
      url:    "https://open.tiktokapis.com/v2/user/info/",
      params: { fields: "open_id,display_name,avatar_url,follower_count,bio_description" },
    },
    profile(profile: Record<string, unknown>) {
      const data   = (profile.data as Record<string, unknown>)?.user as Record<string, unknown> ?? profile;
      const openId = data.open_id as string;
      return {
        id:              openId,
        // TikTok does not provide email — use a stable placeholder derived from open_id
        email:           `${openId}@tiktok.mafluencer.ma`,
        name:            data.display_name    as string,
        image:           data.avatar_url      as string,
        tiktokFollowers: data.follower_count  as number ?? 0,
        tiktokBio:       data.bio_description as string ?? "",
        tiktokHandle:    data.display_name    as string ?? "",
      };
    },
    clientId:     options.clientId,
    clientSecret: options.clientSecret,
    checks:       ["state"],
    style: { logo: "https://www.tiktok.com/favicon.ico", bg: "#000000", text: "#ffffff" },
  };
}

// ── Custom Instagram provider ─────────────────────────────────────────────────
// Uses the new Instagram Login product (Basic Display API deprecated Sep 2024).
// Authorization: https://www.instagram.com/oauth/authorize
// Instagram does not return email — stable placeholder derived from user_id.
function Instagram(options: OAuthUserConfig<Record<string, unknown>>): OAuthConfig<Record<string, unknown>> {
  return {
    id:   "instagram",
    name: "Instagram",
    type: "oauth",
    authorization: {
      url:    "https://www.instagram.com/oauth/authorize",
      params: { scope: "instagram_basic" },
    },
    token:    "https://api.instagram.com/oauth/access_token",
    userinfo: {
      url:    "https://graph.instagram.com/me",
      params: { fields: "id,username,account_type,profile_picture_url,followers_count,media_count" },
    },
    profile(profile: Record<string, unknown>) {
      const igId = profile.id as string;
      return {
        id:                 igId,
        // Instagram does not provide email — use a stable placeholder
        email:              `${igId}@instagram.mafluencer.ma`,
        name:               (profile.username as string) ?? igId,
        image:              profile.profile_picture_url as string ?? null,
        instagramFollowers: profile.followers_count as number ?? 0,
        instagramHandle:    profile.username        as string ?? "",
        mediaCount:         profile.media_count     as number ?? 0,
      };
    },
    clientId:     options.clientId,
    clientSecret: options.clientSecret,
    checks:       ["state"],
    style: { logo: "https://www.instagram.com/favicon.ico", bg: "#E1306C", text: "#ffffff" },
  };
}

// ── Main NextAuth config ──────────────────────────────────────────────────────

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,

  // PrismaAdapter creates User + Account rows on first OAuth login.
  adapter: PrismaAdapter(prisma),

  providers: [
    Google({
      clientId:     process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      // Allows linking a Google account to an existing email/magic-link account.
      // Prevents OAuthAccountNotLinked when same email used across providers.
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          prompt:        "consent",
          access_type:   "offline",
          response_type: "code",
        },
      },
    }),
    Resend({
      apiKey: process.env.RESEND_API_KEY!,
      from:   "Mafluencer <noreply@mafluencer.ma>",
      sendVerificationRequest: async ({ identifier, url, provider }) => {
        const { Resend: ResendSDK } = await import("resend");
        const resend = new ResendSDK(provider.apiKey);
        const { error } = await resend.emails.send({
          from:    provider.from!,
          to:      [identifier],
          subject: "Connexion a Mafluencer",
          html: `
            <div style="font-family:Inter,sans-serif;background:#0F172A;color:#E2E8F0;padding:40px;max-width:520px;margin:0 auto;border-radius:16px;">
              <div style="text-align:center;margin-bottom:32px;">
                <h1 style="font-size:24px;font-weight:700;margin:0;background:linear-gradient(135deg,#6366F1,#EC4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">
                  Mafluencer
                </h1>
              </div>
              <h2 style="font-size:18px;font-weight:600;margin-bottom:8px;">Ton lien de connexion</h2>
              <p style="color:#94A3B8;font-size:14px;margin-bottom:24px;">
                Clique sur le bouton ci-dessous pour te connecter. Ce lien expire dans 10 minutes.
              </p>
              <div style="text-align:center;margin-bottom:32px;">
                <a href="${url}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#6366F1,#EC4899);color:#fff;text-decoration:none;border-radius:12px;font-weight:600;font-size:15px;">
                  Connexion a Mafluencer
                </a>
              </div>
              <p style="color:#475569;font-size:12px;text-align:center;">
                Si tu n'as pas demande ce lien, ignore cet email.
              </p>
            </div>
          `,
        });
        if (error) throw new Error(error.message);
      },
    }),
    TikTok({
      clientId:     "sbawpvgcz2muf15jtr",
      clientSecret: "Au5WTjZddnbibPDHT4WVlzpOBn1lxO93",
    }),
    Instagram({
      clientId:     "26435075029485553",
      clientSecret: "3b5b49ac9b4fc326bd7f38c19046dc44",
    }),
    Credentials({
      credentials: {
        email:    { label: "Email",        type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where:  { email: credentials.email as string },
          select: { id: true, email: true, name: true, image: true, role: true, password: true, emailVerified: true },
        });

        if (!user?.password) return null;

        if (!user.emailVerified) {
          throw new Error("EmailNotVerified");
        }

        const valid = await bcrypt.compare(credentials.password as string, user.password);
        if (!valid) return null;

        return { id: user.id, email: user.email, name: user.name, image: user.image };
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account, profile }) {
      const isSocial = account?.provider === "tiktok" || account?.provider === "instagram";

      // Non-social providers must have an email
      if (!user.email && !isSocial) return false;

      // Super admin: upsert with ADMIN role and return immediately
      if (user.email === "mafluencer.ma@gmail.com") {
        await prisma.user.upsert({
          where:  { email: user.email },
          update: { role: "ADMIN", name: user.name ?? undefined, image: user.image ?? undefined },
          create: { email: user.email, name: user.name ?? "Super Admin", image: user.image ?? null, role: "ADMIN" },
        });
        return true;
      }

      // For social providers: always return true — never block on DB errors.
      // Profile sync runs in a fire-and-forget wrapper (has its own try/catch).
      if (isSocial) {
        // Derive a stable placeholder email if somehow not set by the provider
        const socialEmail = user.email
          ?? `${user.id ?? "unknown"}@${account.provider}.mafluencer.ma`;

        // Ensure user row exists (PrismaAdapter should have created it, but guard)
        try {
          const existing = await prisma.user.findFirst({
            where: { OR: [{ email: socialEmail }, { id: user.id ?? "" }] },
            select: { id: true },
          });
          if (!existing) {
            await prisma.user.create({
              data: { email: socialEmail, name: user.name ?? null, image: user.image ?? null, role: "CREATOR" },
            });
          }
        } catch { /* non-fatal — PrismaAdapter may have already created the row */ }

        // Sync social profile data (non-blocking)
        if (account.provider === "tiktok" && user.id) {
          void syncTikTokProfile(user.id, profile as Record<string, unknown>);
        }
        if (account.provider === "instagram" && user.id) {
          void syncInstagramProfile(user.id, profile as Record<string, unknown>);
        }

        return true;
      }

      // Email/OAuth (Google, Credentials, Resend)
      try {
        const email = user.email!;
        const existing = await prisma.user.findUnique({
          where:  { email },
          select: { id: true },
        });
        if (!existing) {
          await prisma.user.create({
            data: { email, name: user.name ?? null, image: user.image ?? null, role: "CREATOR" },
          });

          // Send welcome email — non-blocking
          try {
            const { Resend: ResendSDK } = await import("resend");
            const resend = new ResendSDK(process.env.RESEND_API_KEY!);
            const displayName = user.name ? user.name.split(" ")[0] : "Creator";
            await resend.emails.send({
              from:    "Mafluencer <noreply@mafluencer.ma>",
              to:      [email],
              subject: "Bienvenue sur Mafluencer",
              html: `
                <div style="font-family:Inter,sans-serif;background:#0F172A;color:#E2E8F0;padding:40px;max-width:520px;margin:0 auto;border-radius:16px;">
                  <div style="text-align:center;margin-bottom:32px;">
                    <h1 style="font-size:24px;font-weight:700;margin:0;background:linear-gradient(135deg,#6366F1,#EC4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">
                      Mafluencer
                    </h1>
                  </div>
                  <h2 style="font-size:20px;font-weight:700;margin-bottom:8px;color:#E2E8F0;">
                    Bienvenue sur Mafluencer, ${displayName} !
                  </h2>
                  <p style="color:#94A3B8;font-size:14px;margin-bottom:24px;line-height:1.6;">
                    Ton compte a ete cree avec succes. Tu peux maintenant relever des defis creativite,
                    construire ton Mafluencer Score et recevoir des missions payantes des meilleures
                    marques du Maroc.
                  </p>
                  <div style="background:#1E293B;border-radius:12px;padding:20px;margin-bottom:24px;">
                    <p style="font-size:13px;font-weight:600;color:#E2E8F0;margin:0 0 12px 0;">Ce qui t'attend :</p>
                    <ul style="list-style:none;padding:0;margin:0;color:#94A3B8;font-size:13px;line-height:2;">
                      <li>Defis creatifs hebdomadaires</li>
                      <li>Score public (Rookie - Legend)</li>
                      <li>Missions payantes des brands</li>
                      <li>Leaderboard national des creators</li>
                    </ul>
                  </div>
                  <div style="text-align:center;margin-bottom:32px;">
                    <a href="${process.env.NEXTAUTH_URL ?? "https://mafluencer.ma"}/dashboard"
                       style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#6366F1,#EC4899);color:#fff;text-decoration:none;border-radius:12px;font-weight:600;font-size:15px;">
                      Acceder a mon dashboard
                    </a>
                  </div>
                  <p style="color:#475569;font-size:12px;text-align:center;">
                    L'equipe Mafluencer — Maroc
                  </p>
                </div>
              `,
            });
          } catch { /* email failure must never block auth */ }
        }

        return true;
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.includes("OAuthAccountNotLinked")) return "/auth/signin?error=EmailExists";
        return false;
      }
    },

    async jwt({ token, user, trigger }) {
      // Super admin: always force ADMIN role in token regardless of DB state
      if (user?.email === "mafluencer.ma@gmail.com" || token.email === "mafluencer.ma@gmail.com") {
        token.role = "ADMIN";
      }

      // First sign-in: user object is populated — fetch role from DB and encode in token
      if (user?.email && user.email !== "mafluencer.ma@gmail.com") {
        try {
          const dbUser = await prisma.user.findFirst({
            where:  { OR: [{ email: user.email }, { id: user.id ?? "" }] },
            select: { id: true, role: true },
          });
          if (dbUser) {
            token.id   = dbUser.id;
            token.role = dbUser.role;
          } else {
            // DB user not found — default to CREATOR so session is always valid
            token.id   = token.id   ?? user.id ?? "";
            token.role = token.role ?? "CREATOR";
          }
        } catch {
          token.id   = token.id   ?? user.id ?? "";
          token.role = token.role ?? "CREATOR";
        }
      } else if (user?.email === "mafluencer.ma@gmail.com") {
        const dbUser = await prisma.user.findUnique({
          where:  { email: user.email },
          select: { id: true },
        });
        if (dbUser) token.id = dbUser.id;
      }

      // update() called client-side — re-fetch role from DB to refresh JWT cookie
      if (trigger === "update" && token.id) {
        const dbUser = await prisma.user.findUnique({
          where:  { id: token.id as string },
          select: { role: true },
        });
        // Super admin role is always ADMIN regardless of what DB says
        if (dbUser) {
          token.role = token.email === "mafluencer.ma@gmail.com" ? "ADMIN" : dbUser.role;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id    = token.id    as string;
        session.user.role  = (token.role as string) ?? "CREATOR";
        session.user.email = token.email as string;
        session.user.name  = token.name  as string;
        session.user.image = token.picture as string;
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      try {
        if (new URL(url).origin === baseUrl) return url;
      } catch { /* malformed */ }
      return `${baseUrl}/dashboard`;
    },
  },

  secret:    process.env.NEXTAUTH_SECRET,
  trustHost: true,
});

// ── Social profile sync helpers ───────────────────────────────────────────────

async function syncTikTokProfile(userId: string, profile: Record<string, unknown>) {
  try {
    const data      = (profile?.data as Record<string, unknown>)?.user as Record<string, unknown> ?? profile ?? {};
    const followers = (data.follower_count  ?? data.tiktokFollowers) as number ?? 0;
    const handle    = (data.display_name    ?? data.tiktokHandle)    as string ?? "";
    const bio       = (data.bio_description ?? data.tiktokBio)       as string ?? "";
    const existing  = await prisma.creatorProfile.findUnique({ where: { userId } });
    if (existing) {
      await prisma.creatorProfile.update({ where: { userId }, data: {
        followersCount: followers || existing.followersCount,
        tiktokHandle:   handle   || existing.tiktokHandle,
        bio:            bio      || existing.bio,
        // Auto-verify creator profile on TikTok OAuth — they proved ownership
        verified:       true,
      }});
    } else {
      await prisma.creatorProfile.create({ data: {
        userId,
        followersCount: followers,
        tiktokHandle:   handle,
        bio,
        niches:         [],
        score:          0,
        level:          "Rookie",
        // Verified from day 1 — TikTok OAuth proves account ownership
        verified:       true,
      }});
    }
  } catch { /* non-fatal */ }
}

async function syncInstagramProfile(userId: string, profile: Record<string, unknown>) {
  try {
    const followers = (profile.followers_count ?? profile.instagramFollowers) as number ?? 0;
    const handle    = (profile.username        ?? profile.instagramHandle)    as string ?? "";
    const bio       = (profile.biography       ?? profile.instagramBio)       as string ?? "";
    const existing  = await prisma.creatorProfile.findUnique({ where: { userId } });
    if (existing) {
      await prisma.creatorProfile.update({ where: { userId }, data: {
        followersCount:  followers || existing.followersCount,
        instagramHandle: handle   || existing.instagramHandle,
        bio:             bio      || existing.bio,
        // Auto-verify on Instagram OAuth — they proved ownership
        verified:        true,
      }});
    } else {
      await prisma.creatorProfile.create({ data: {
        userId,
        followersCount:  followers,
        instagramHandle: handle,
        bio,
        niches:          [],
        score:           0,
        level:           "Rookie",
        verified:        true,
      }});
    }
  } catch { /* non-fatal */ }
}
