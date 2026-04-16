import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { OverviewSkeleton } from "@/components/dashboard/skeleton-page";
import AdminOverviewContent from "./_content";

export const metadata: Metadata = {
  title: "Admin — Vue d'ensemble",
  description: "Stats globales de la plateforme Mafluencer",
};

export default async function AdminOverviewPage() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session || role !== "ADMIN") redirect("/auth/signin");
  return (
    <Suspense fallback={<div className="max-w-6xl space-y-4"><OverviewSkeleton /></div>}>
      <AdminOverviewContent />
    </Suspense>
  );
}
