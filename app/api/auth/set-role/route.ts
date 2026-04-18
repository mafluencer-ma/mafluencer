import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { role } = await req.json() as { role?: string };
  if (role !== "BRAND" && role !== "CREATOR") {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  // Fetch current role — never demote BRAND or ADMIN
  const dbUser = await prisma.user.findUnique({
    where:  { id: session.user.id },
    select: { role: true },
  });

  if (!dbUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Only apply BRAND upgrade if user is currently CREATOR (the default)
  if (role === "BRAND" && dbUser.role === "CREATOR") {
    await prisma.user.update({
      where: { id: session.user.id },
      data:  { role: "BRAND" },
    });

    // Ensure BrandProfile exists
    const existing = await prisma.brandProfile.findUnique({
      where: { userId: session.user.id },
    });
    if (!existing) {
      await prisma.brandProfile.create({
        data: {
          userId:      session.user.id,
          companyName: session.user.name ?? "Ma Marque",
          balance:     0,
        },
      });
    }

    return NextResponse.json({ role: "BRAND" });
  }

  // Return current role (no update needed)
  return NextResponse.json({ role: dbUser.role });
}
