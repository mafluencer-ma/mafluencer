import { NextResponse }   from "next/server";
import { auth }           from "@/lib/auth";
import { prisma }         from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as { id: string }).id;

  const profile = await prisma.creatorProfile.findUnique({
    where:  { userId },
    select: { tiktokHandle: true, instagramHandle: true },
  });

  const email = session.user.email ?? "";

  // Determine how the user first authenticated
  let loginProvider: "tiktok" | "instagram" | "google" | "email" = "email";
  if (email.endsWith("@tiktok.mafluencer.ma"))     loginProvider = "tiktok";
  else if (email.endsWith("@instagram.mafluencer.ma")) loginProvider = "instagram";
  else {
    const googleAccount = await prisma.account.findFirst({
      where: { userId, provider: "google" },
    });
    if (googleAccount) loginProvider = "google";
  }

  return NextResponse.json({
    loginProvider,
    tiktok:    Boolean(profile?.tiktokHandle),
    instagram: Boolean(profile?.instagramHandle),
  });
}
