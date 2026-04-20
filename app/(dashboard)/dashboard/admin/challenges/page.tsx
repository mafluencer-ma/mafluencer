import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ListSkeleton } from "@/components/dashboard/skeleton-page";
import AdminChallengesContent from "./_content";

export const metadata: Metadata = {
  title: "Admin — Défis",
  description: "CRUD des défis hebdomadaires",
};

export default async function AdminChallengesPage() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session || (role !== "ADMIN" && role !== "MANAGER")) redirect("/auth/signin");
  return (
    <Suspense fallback={<div className="max-w-6xl space-y-4"><ListSkeleton rows={6} /></div>}>
      <AdminChallengesContent />
    </Suspense>
  );
}
