import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ListSkeleton } from "@/components/dashboard/skeleton-page";
import CreatorStatsContent from "./_content";

export const metadata: Metadata = {
  title: "Statistiques — Dashboard Creator",
  description: "Performance, engagement et progression de ton score",
};

export default async function CreatorStatsPage() {
  const session = await auth();
  if (!session) redirect("/auth/signin");
  return (
    <Suspense fallback={<div className="max-w-5xl space-y-4"><ListSkeleton rows={6} /></div>}>
      <CreatorStatsContent />
    </Suspense>
  );
}
