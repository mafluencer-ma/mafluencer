import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ListSkeleton } from "@/components/dashboard/skeleton-page";
import BrandMissionsContent from "./_content";

export const metadata: Metadata = {
  title: "Missions — Dashboard Brand",
  description: "Gère tes missions en cours avec les creators",
};

export default async function BrandMissionsPage() {
  const session = await auth();
  if (!session) redirect("/auth/signin");
  return (
    <Suspense fallback={<div className="max-w-5xl space-y-4"><ListSkeleton rows={5} /></div>}>
      <BrandMissionsContent />
    </Suspense>
  );
}
