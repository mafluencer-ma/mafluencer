import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { FormSkeleton } from "@/components/dashboard/skeleton-page";
import ProfileFormContent from "./_content";

export const metadata: Metadata = {
  title: "Mon Profil — Dashboard Creator",
  description: "Édite ton profil creator : bio, niches, tarifs et portfolio",
};

export default async function ProfilePage() {
  const session = await auth();
  if (!session) redirect("/auth/signin");
  return (
    <Suspense fallback={<div className="max-w-3xl"><FormSkeleton /></div>}>
      <ProfileFormContent session={session} />
    </Suspense>
  );
}
