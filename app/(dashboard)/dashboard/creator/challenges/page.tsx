import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ListSkeleton } from "@/components/dashboard/skeleton-page";
import ChallengesContent from "./_content";

export const metadata: Metadata = {
  title: "Mes Défis — Dashboard Creator",
  description: "Défis de la semaine et historique de tes participations",
};

export default async function ChallengesPage() {
  const session = await auth();
  if (!session) redirect("/auth/signin");
  return (
    <Suspense fallback={<div className="space-y-4"><ListSkeleton rows={3} /><ListSkeleton rows={4} /></div>}>
      <ChallengesContent />
    </Suspense>
  );
}
