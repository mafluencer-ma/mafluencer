import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ListSkeleton } from "@/components/dashboard/skeleton-page";
import MissionsContent from "./_content";

export const metadata: Metadata = {
  title: "Missions — Dashboard Creator",
  description: "Tes missions sponsorisées : briefs, budgets et suivi",
};

export default async function MissionsPage() {
  const session = await auth();
  if (!session) redirect("/auth/signin");
  return (
    <Suspense fallback={<div className="max-w-4xl space-y-4"><ListSkeleton rows={4} /></div>}>
      <MissionsContent />
    </Suspense>
  );
}
