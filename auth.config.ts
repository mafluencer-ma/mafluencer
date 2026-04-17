// auth.config.ts — Edge-compatible NextAuth config (no pg/prisma imports)
// Used by middleware.ts which runs in the Edge runtime.
// lib/auth.ts extends this with PrismaAdapter + full providers for Node.js routes.

import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/auth/signin",
    error:  "/auth/signin",
  },

  session: { strategy: "jwt" },

  callbacks: {
    // In middleware context this callback receives the already-built token.
    // id and role were set by lib/auth.ts jwt callback (Node.js) on first sign-in.
    // We just pass the token through — no DB call needed here.
    jwt({ token }) {
      return token;
    },

    session({ session, token }) {
      if (session.user) {
        session.user.id   = (token.id   as string) ?? "";
        session.user.role = (token.role as string) ?? "CREATOR";
      }
      return session;
    },
  },

  // No providers here — providers with Node.js deps live in lib/auth.ts
  providers: [],
};
