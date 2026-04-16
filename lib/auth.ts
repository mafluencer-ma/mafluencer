import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId:     process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    Resend({
      apiKey: process.env.RESEND_API_KEY!,
      from:   "Mafluencer <noreply@mafluencer.ma>",
    }),
  ],
  pages: {
    signIn:  "/auth/signin",
    newUser: "/auth/register",
    error:   "/auth/signin",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      // On first sign-in `user` is populated — always fetch fresh role from DB
      if (user?.id) {
        token.id = user.id;
        const dbUser = await prisma.user.findUnique({
          where:  { id: user.id },
          select: { role: true },
        });
        token.role = dbUser?.role ?? "CREATOR";
      }
      // Re-fetch on explicit update (e.g. role change)
      if (trigger === "update" && token.id) {
        const dbUser = await prisma.user.findUnique({
          where:  { id: token.id as string },
          select: { role: true },
        });
        if (dbUser) token.role = dbUser.role;
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
      // Allow relative URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allow same-origin URLs
      try {
        if (new URL(url).origin === baseUrl) return url;
      } catch {
        // malformed URL — fall through
      }
      return `${baseUrl}/dashboard/creator`;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
});
