import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ListSkeleton } from "@/components/dashboard/skeleton-page";
import AdminMissionsContent from "./_content";

export const metadata: Metadata = {
  title: "Admin — Missions",
  description: "Toutes les missions avec commissions",
};

export default async function AdminMissionsPage() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session || (role !== "ADMIN" && role !== "MANAGER")) redirect("/auth/signin");
  return (
    <Suspense fallback={<div className="max-w-6xl space-y-4"><ListSkeleton rows={8} /></div>}>
      <AdminMissionsContent />
    </Suspense>
  );
}
