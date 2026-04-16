import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { OverviewSkeleton } from "@/components/dashboard/skeleton-page";
import BrandOverviewContent from "./_content";

export const metadata: Metadata = {
  title: "Vue d'ensemble — Dashboard Brand",
  description: "Campagnes actives, dépenses et performances de tes missions",
};

export default async function BrandOverviewPage() {
  const session = await auth();
  if (!session) redirect("/auth/signin");
  return (
    <Suspense fallback={<div className="max-w-5xl space-y-4"><OverviewSkeleton /></div>}>
      <BrandOverviewContent session={session} />
    </Suspense>
  );
}
