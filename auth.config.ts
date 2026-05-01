// auth.config.ts — Edge-compatible NextAuth config (no pg/prisma imports)
// Used by middleware.ts which runs in the Edge runtime.
// lib/auth.ts extends this with PrismaAdapter + full providers for Node.js routes.

import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";


export const authConfig: NextAuthConfig = {
  trustHost: true,
  // Must match lib/auth.ts so middleware can verify JWTs it didn't create
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,

  pages: {
    signIn: "/auth/signin",
    error:  "/auth/signin",
  },

  session: { strategy: "jwt" },

  // Google provider included here so allowDangerousEmailAccountLinking is
  // applied at the Edge level too (prevents OAuthAccountNotLinked errors).
  providers: [
    Google({
      clientId:     process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
  ],

  callbacks: {
    jwt({ token }) {
      // Token already contains id + role set by lib/auth.ts on first sign-in.
      // Just pass it through — no DB call here.
      return token;
    },

    session({ session, token }) {
      if (session.user) {
        session.user.id   = (token.id   as string) ?? "";
        session.user.role = (token.role as string) ?? "CREATOR";
      }
      return session;
    },

    redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      try {
        const parsed = new URL(url);
        if (parsed.origin === baseUrl) {
          // Never land on bare base URL — always go to at least /dashboard
          return parsed.pathname === "/" || parsed.pathname === ""
            ? `${baseUrl}/dashboard`
            : url;
        }
      } catch { /* malformed url */ }
      return `${baseUrl}/dashboard`;
    },
  },
};
