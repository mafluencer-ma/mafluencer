import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ListSkeleton } from "@/components/dashboard/skeleton-page";
import EarningsContent from "./_content";

export const metadata: Metadata = {
  title: "Revenus — Dashboard Creator",
  description: "Solde, historique des transactions et retraits",
};

export default async function EarningsPage() {
  const session = await auth();
  if (!session) redirect("/auth/signin");
  return (
    <Suspense fallback={<div className="max-w-4xl space-y-4"><ListSkeleton rows={5} /></div>}>
      <EarningsContent />
    </Suspense>
  );
}
