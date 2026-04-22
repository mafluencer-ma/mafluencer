import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import AdminContentEditor from "./_content";

export const metadata: Metadata = {
  title: "Pages légales — Admin Mafluencer",
  description: "Modifier les pages Conditions Générales et Politique de Confidentialité",
};

export default async function AdminContentPage() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session || (role !== "ADMIN" && role !== "MANAGER")) redirect("/auth/signin");

  return (
    <Suspense fallback={<div className="max-w-4xl space-y-4 animate-pulse"><div className="h-12 bg-slate-800/60 rounded-xl w-64" /><div className="h-96 bg-slate-800/60 rounded-2xl" /></div>}>
      <AdminContentEditor />
    </Suspense>
  );
}
