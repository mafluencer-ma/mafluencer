import NextAuth from "next-auth";
import type { OAuthConfig, OAuthUserConfig } from "next-auth/providers";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

// ── Custom TikTok provider ────────────────────────────────────────────────────
// TikTok Login Kit v2
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
        id:    data.open_id as string,
        name:  data.display_name as string,
        image: data.avatar_url as string,
        tiktokFollowers:   data.follower_count as number  ?? 0,
        tiktokBio:         data.bio_description as string ?? "",
        tiktokHandle:      data.display_name as string    ?? "",
      };
    },
    clientId:     options.clientId,
    clientSecret: options.clientSecret,
    checks:       ["state"],
    style: {
      logo:  "https://www.tiktok.com/favicon.ico",
      bg:    "#000000",
      text:  "#ffffff",
    },
  };
}

// ── Custom Instagram provider ─────────────────────────────────────────────────
// Instagram Basic Display API (app-level)
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
        id:    profile.id as string,
        name:  (profile.name as string) ?? (profile.username as string),
        image: profile.profile_picture_url as string,
        instagramFollowers: profile.followers_count as number  ?? 0,
        instagramHandle:    profile.username       as string   ?? "",
        instagramBio:       profile.biography      as string   ?? "",
        mediaCount:         profile.media_count    as number   ?? 0,
      };
    },
    clientId:     options.clientId,
    clientSecret: options.clientSecret,
    checks:       ["state"],
    style: {
      logo:  "https://www.instagram.com/favicon.ico",
      bg:    "#E1306C",
      text:  "#ffffff",
    },
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
        // Resend SDK call
        const { Resend: ResendSDK } = await import("resend");
        const resend = new ResendSDK(provider.apiKey);

        const { error } = await resend.emails.send({
          from:    provider.from!,
          to:      [identifier],
          subject: "Connexion à Mafluencer",
          html: `
            <div style="font-family:Inter,sans-serif;background:#0F172A;color:#E2E8F0;padding:40px;max-width:520px;margin:0 auto;border-radius:16px;">
              <div style="text-align:center;margin-bottom:32px;">
                <h1 style="font-size:24px;font-weight:700;margin:0;background:linear-gradient(135deg,#6366F1,#EC4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">
                  Mafluencer
                </h1>
              </div>
              <h2 style="font-size:18px;font-weight:600;margin-bottom:8px;">Ton lien de connexion</h2>
              <p style="color:#94A3B8;font-size:14px;margin-bottom:24px;">
                Clique sur le bouton ci-dessous pour te connecter à ton compte Mafluencer. Ce lien expire dans 10 minutes.
              </p>
              <div style="text-align:center;margin-bottom:32px;">
                <a href="${url}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#6366F1,#EC4899);color:#fff;text-decoration:none;border-radius:12px;font-weight:600;font-size:15px;">
                  Connexion à Mafluencer
                </a>
              </div>
              <p style="color:#475569;font-size:12px;text-align:center;">
                Si tu n'as pas demandé ce lien, ignore cet email.
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
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) return false;
      try {
        // Upsert user so it always exists in DB regardless of adapter behaviour
        const existing = await prisma.user.findUnique({
          where:  { email: user.email },
          select: { id: true },
        });
        if (!existing) {
          await prisma.user.create({
            data: {
              email: user.email,
              name:  user.name  ?? null,
              image: user.image ?? null,
              role:  "CREATOR",
            },
          });
        } else if (user.image) {
          // Keep avatar fresh on subsequent logins
          await prisma.user.update({
            where: { email: user.email },
            data:  { image: user.image, name: user.name ?? undefined },
          });
        }
        return true;
      } catch (e) {
        console.error("[auth] signIn callback error:", e);
        return false;
      }
    },

    async jwt({ token, user, account, trigger }) {
      // On first sign-in: persist id + role from DB
      if (user?.email) {
        const dbUser = await prisma.user.findUnique({
          where:  { email: user.email },
          select: { id: true, role: true },
        });
        if (dbUser) {
          token.id   = dbUser.id;
          token.role = dbUser.role;
        }
      }

      // Re-fetch on session update trigger
      if (trigger === "update" && token.id) {
        const dbUser = await prisma.user.findUnique({
          where:  { id: token.id as string },
          select: { role: true },
        });
        if (dbUser) token.role = dbUser.role;
      }

      // After TikTok login — sync social profile data
      if (account?.provider === "tiktok" && user) {
        await syncTikTokProfile(token.id as string, user as Record<string, unknown>);
      }

      // After Instagram login — sync social profile data
      if (account?.provider === "instagram" && user) {
        await syncInstagramProfile(token.id as string, user as Record<string, unknown>);
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id   = token.id   as string;
        session.user.role = token.role as string;
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      // Allow relative URLs from callbackUrl params
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      try {
        if (new URL(url).origin === baseUrl) return url;
      } catch {
        // malformed URL — fall through to default
      }
      // Default: let middleware route to the right dashboard by role
      return `${baseUrl}/dashboard`;
    },
  },
  secret:    process.env.NEXTAUTH_SECRET,
  trustHost: true,
});

// ── Social profile sync helpers ───────────────────────────────────────────────

async function syncTikTokProfile(userId: string, userData: Record<string, unknown>) {
  try {
    const profile = await prisma.creatorProfile.findUnique({ where: { userId } });
    const followers = userData.tiktokFollowers as number ?? 0;
    const handle    = userData.tiktokHandle   as string ?? "";
    const bio       = userData.tiktokBio      as string ?? "";

    if (profile) {
      await prisma.creatorProfile.update({
        where: { userId },
        data: {
          followersCount: followers,
          tiktokHandle:   handle || profile.tiktokHandle,
          bio:            bio    || profile.bio,
        },
      });
    } else {
      await prisma.creatorProfile.create({
        data: {
          userId,
          followersCount: followers,
          tiktokHandle:   handle,
          bio,
          niches:         [],
          score:          0,
          level:          "Rookie",
        },
      });
    }
  } catch {
    // Non-fatal — don't block auth
  }
}

async function syncInstagramProfile(userId: string, userData: Record<string, unknown>) {
  try {
    const profile     = await prisma.creatorProfile.findUnique({ where: { userId } });
    const followers   = userData.instagramFollowers as number ?? 0;
    const handle      = userData.instagramHandle   as string ?? "";
    const bio         = userData.instagramBio      as string ?? "";

    if (profile) {
      await prisma.creatorProfile.update({
        where: { userId },
        data: {
          followersCount:  followers,
          instagramHandle: handle || profile.instagramHandle,
          bio:             bio    || profile.bio,
        },
      });
    } else {
      await prisma.creatorProfile.create({
        data: {
          userId,
          followersCount:  followers,
          instagramHandle: handle,
          bio,
          niches:          [],
          score:           0,
          level:           "Rookie",
        },
      });
    }
  } catch {
    // Non-fatal — don't block auth
  }
}
