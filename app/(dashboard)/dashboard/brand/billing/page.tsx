import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ListSkeleton } from "@/components/dashboard/skeleton-page";
import BillingContent from "./_content";

export const metadata: Metadata = {
  title: "Facturation — Dashboard Brand",
  description: "Recharge ton solde et consulte l'historique de tes transactions",
};

export default async function BillingPage() {
  const session = await auth();
  if (!session) redirect("/auth/signin");
  return (
    <Suspense fallback={<div className="max-w-4xl space-y-4"><ListSkeleton rows={5} /></div>}>
      <BillingContent />
    </Suspense>
  );
}
