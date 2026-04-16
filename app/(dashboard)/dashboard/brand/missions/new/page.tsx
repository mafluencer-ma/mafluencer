import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { FormSkeleton } from "@/components/dashboard/skeleton-page";
import NewMissionContent from "./_content";

export const metadata: Metadata = {
  title: "Créer une mission — Dashboard Brand",
  description: "Lance une mission sponsorisée auprès d'un creator Mafluencer",
};

export default async function NewMissionPage() {
  const session = await auth();
  if (!session) redirect("/auth/signin");
  return (
    <Suspense fallback={<div className="max-w-3xl"><FormSkeleton /></div>}>
      <NewMissionContent />
    </Suspense>
  );
}
