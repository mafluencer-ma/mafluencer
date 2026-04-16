import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ListSkeleton } from "@/components/dashboard/skeleton-page";
import BrandDiscoverContent from "./_content";

export const metadata: Metadata = {
  title: "Découvrir des creators — Dashboard Brand",
  description: "Parcours le leaderboard et trouve les creators idéaux pour tes campagnes",
};

export default async function BrandDiscoverPage() {
  const session = await auth();
  if (!session) redirect("/auth/signin");
  return (
    <Suspense fallback={<div className="max-w-5xl space-y-4"><ListSkeleton rows={6} /></div>}>
      <BrandDiscoverContent />
    </Suspense>
  );
}
