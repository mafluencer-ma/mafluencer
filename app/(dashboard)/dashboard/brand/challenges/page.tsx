import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ListSkeleton } from "@/components/dashboard/skeleton-page";
import BrandChallengesContent from "./_content";

export const metadata: Metadata = {
  title: "Défis — Dashboard Brand",
  description: "Gère et crée tes défis sponsorisés",
};

export default async function BrandChallengesPage() {
  const session = await auth();
  if (!session) redirect("/auth/signin");
  return (
    <Suspense fallback={<div className="max-w-5xl space-y-4"><ListSkeleton rows={4} /></div>}>
      <BrandChallengesContent />
    </Suspense>
  );
}
