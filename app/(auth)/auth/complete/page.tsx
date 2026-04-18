// /auth/complete — server-side role assignment after OAuth/magic-link signup.
//
// Flow:
//   1. User picks BRAND or CREATOR on /auth/register
//   2. callbackUrl is set to /auth/complete?role=BRAND (or CREATOR)
//   3. After auth completes, NextAuth redirects here
//   4. We read the role param, update the user in DB, redirect to dashboard
//
// Only updates the role if the user currently has the default CREATOR role
// (prevents overwriting an existing BRAND/ADMIN role on subsequent sign-ins).

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AuthCompletePage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const session = await auth();

  // Not authenticated — send to signin
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const { role: roleParam } = await searchParams;
  const requestedRole = roleParam === "BRAND" ? "BRAND" : "CREATOR";

  // Fetch current DB role
  const dbUser = await prisma.user.findUnique({
    where:  { id: session.user.id },
    select: { role: true },
  });

  // Only update if:
  //   - roleParam is BRAND (CREATOR is the default so no update needed), OR
  //   - user currently has default CREATOR role (don't demote BRAND/ADMIN)
  if (requestedRole === "BRAND" && dbUser?.role === "CREATOR") {
    await prisma.user.update({
      where: { id: session.user.id },
      data:  { role: "BRAND" },
    });

    // Also create a bare BrandProfile so the brand dashboard loads
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
  }

  // Redirect to the correct dashboard.
  // Use the final role (updated or original).
  const finalRole = requestedRole === "BRAND" ? "BRAND" : (dbUser?.role ?? "CREATOR");
  const dest =
    finalRole === "BRAND"  ? "/dashboard/brand"   :
    finalRole === "ADMIN"  ? "/dashboard/admin"   :
    "/dashboard/creator";

  redirect(dest);
}
