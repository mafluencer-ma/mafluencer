import NextAuth from "next-auth";
import type { OAuthConfig, OAuthUserConfig } from "next-auth/providers";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

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
      url:  "https://open.tiktokapis.com/v2/oauth/token/",
      async request({ params, provider }) {
        const res = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
          method:  "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            client_key:    provider.clientId!,
            client_secret: provider.clientSecret!,
            code:          params.code!,
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
      const data = (profile.data as Record<string, unknown>)?.user as Record<string, unknown> ?? profile;
      return {
        id:              data.open_id         as string,
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
function Instagram(options: OAuthUserConfig<Record<string, unknown>>): OAuthConfig<Record<string, unknown>> {
  return {
    id:   "instagram",
    name: "Instagram",
    type: "oauth",
    authorization: {
      url:    "https://api.instagram.com/oauth/authorize",
      params: { scope: "user_profile,user_media" },
    },
    token:    "https://api.instagram.com/oauth/access_token",
    userinfo: {
      url:    "https://graph.instagram.com/me",
      params: { fields: "id,username,name,account_type,profile_picture_url,followers_count,media_count,biography" },
    },
    profile(profile: Record<string, unknown>) {
      return {
        id:                 profile.id                   as string,
        name:               (profile.name as string)     ?? (profile.username as string),
        image:              profile.profile_picture_url  as string,
        instagramFollowers: profile.followers_count      as number ?? 0,
        instagramHandle:    profile.username             as string ?? "",
        instagramBio:       profile.biography            as string ?? "",
        mediaCount:         profile.media_count          as number ?? 0,
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
  adapter: PrismaAdapter(prisma),

  providers: [
    Google({
      clientId:     process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
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
      clientId:     process.env.TIKTOK_CLIENT_KEY!,
      clientSecret: process.env.TIKTOK_CLIENT_SECRET!,
    }),
    Instagram({
      clientId:     process.env.INSTAGRAM_CLIENT_ID!,
      clientSecret: process.env.INSTAGRAM_CLIENT_SECRET!,
    }),
  ],

  pages: {
    signIn: "/auth/signin",
    error:  "/auth/signin",
  },

  // No session.strategy — PrismaAdapter defaults to "database" strategy.
  // Sessions are stored in the Session table; cookies hold a session token.

  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) return false;

      try {
        // Ensure the user row exists with a role (adapter creates it, but may
        // not set a default role in all edge cases).
        const dbUser = await prisma.user.findUnique({
          where:  { email: user.email },
          select: { id: true, role: true },
        });

        if (!dbUser) {
          // Adapter should have already created the user before this callback,
          // but as a safety net create it here if missing.
          await prisma.user.create({
            data: {
              email: user.email,
              name:  user.name  ?? null,
              image: user.image ?? null,
              role:  "CREATOR",
            },
          });
        }

        // Sync TikTok profile data after OAuth
        if (account?.provider === "tiktok" && user.id) {
          await syncTikTokProfile(user.id, profile as Record<string, unknown>);
        }

        // Sync Instagram profile data after OAuth
        if (account?.provider === "instagram" && user.id) {
          await syncInstagramProfile(user.id, profile as Record<string, unknown>);
        }

        return true;
      } catch (e) {
        console.error("[auth] signIn callback error:", e);
        return false;
      }
    },

    async session({ session, user }) {
      // user is the AdapterUser from the database — includes all User model fields
      if (session.user) {
        session.user.id   = user.id;
        session.user.role = (user as unknown as { role: string }).role ?? "CREATOR";
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      try {
        if (new URL(url).origin === baseUrl) return url;
      } catch {
        // malformed URL
      }
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

    const existing = await prisma.creatorProfile.findUnique({ where: { userId } });
    if (existing) {
      await prisma.creatorProfile.update({
        where: { userId },
        data: {
          followersCount: followers || existing.followersCount,
          tiktokHandle:   handle   || existing.tiktokHandle,
          bio:            bio      || existing.bio,
        },
      });
    } else {
      await prisma.creatorProfile.create({
        data: { userId, followersCount: followers, tiktokHandle: handle, bio, niches: [], score: 0, level: "Rookie" },
      });
    }
  } catch {
    // Non-fatal — don't block auth
  }
}

async function syncInstagramProfile(userId: string, profile: Record<string, unknown>) {
  try {
    const followers = (profile.followers_count ?? profile.instagramFollowers) as number ?? 0;
    const handle    = (profile.username        ?? profile.instagramHandle)    as string ?? "";
    const bio       = (profile.biography       ?? profile.instagramBio)       as string ?? "";

    const existing = await prisma.creatorProfile.findUnique({ where: { userId } });
    if (existing) {
      await prisma.creatorProfile.update({
        where: { userId },
        data: {
          followersCount:  followers || existing.followersCount,
          instagramHandle: handle   || existing.instagramHandle,
          bio:             bio      || existing.bio,
        },
      });
    } else {
      await prisma.creatorProfile.create({
        data: { userId, followersCount: followers, instagramHandle: handle, bio, niches: [], score: 0, level: "Rookie" },
      });
    }
  } catch {
    // Non-fatal — don't block auth
  }
}
