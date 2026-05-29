import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { XCircle, CreditCard, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Paiement échoué — Mafluencer",
};

export default async function PaymentErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/auth/signin");

  const { ref } = await searchParams;

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="glass rounded-[24px] p-10 max-w-md w-full text-center shadow-2xl space-y-6">
        {/* Icon */}
        <div className="w-20 h-20 rounded-full bg-red-500/15 flex items-center justify-center mx-auto ring-1 ring-red-500/20">
          <XCircle size={40} className="text-red-400" />
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-2xl font-heading font-bold text-slate-100">
            Paiement échoué
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Le paiement a été annulé ou a échoué. Aucun montant n&apos;a été
            débité de ta carte. Tu peux réessayer depuis la facturation.
          </p>
        </div>

        {/* Transaction ref */}
        {ref && (
          <div className="bg-slate-800/60 rounded-[12px] px-4 py-3 border border-white/[0.06]">
            <p className="text-xs text-slate-500 mb-1">Référence transaction</p>
            <p className="text-xs text-slate-400 font-mono break-all">{ref}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Link
            href="/dashboard/brand/billing"
            className="flex items-center justify-center gap-2 w-full py-3 px-6 bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white rounded-[12px] font-semibold text-sm transition-all duration-200"
          >
            <CreditCard size={15} />
            Réessayer le paiement
          </Link>
          <Link
            href="/dashboard/brand"
            className="flex items-center justify-center gap-2 w-full py-3 px-6 bg-slate-800/60 hover:bg-slate-700/60 text-slate-300 rounded-[12px] text-sm transition-all duration-200 border border-white/[0.08]"
          >
            <ArrowLeft size={14} />
            Retour au dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
