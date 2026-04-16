import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { FormSkeleton } from "@/components/dashboard/skeleton-page";
import NewChallengeContent from "./_content";

export const metadata: Metadata = {
  title: "Créer un défi — Dashboard Brand",
  description: "Lance un défi sponsorisé avec prize pool pour les creators Mafluencer",
};

export default async function NewChallengePage() {
  const session = await auth();
  if (!session) redirect("/auth/signin");
  return (
    <Suspense fallback={<div className="max-w-3xl"><FormSkeleton /></div>}>
      <NewChallengeContent />
    </Suspense>
  );
}
