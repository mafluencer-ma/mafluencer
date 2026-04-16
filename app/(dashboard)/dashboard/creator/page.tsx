import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { OverviewSkeleton } from "@/components/dashboard/skeleton-page";
import CreatorOverviewContent from "./_components/overview-content";

export const metadata: Metadata = {
  title: "Dashboard Creator",
  description: "Vue d'ensemble de tes performances sur Mafluencer",
};

export default async function CreatorDashboard() {
  const session = await auth();
  if (!session) redirect("/auth/signin");

  return (
    <Suspense fallback={<OverviewSkeleton />}>
      <CreatorOverviewContent session={session} />
    </Suspense>
  );
}
