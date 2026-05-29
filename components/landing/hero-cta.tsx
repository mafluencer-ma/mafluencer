"use client";

import Link from "next/link";
import { ArrowRight, Play, LayoutDashboard } from "lucide-react";
import { useSession } from "next-auth/react";

export default function HeroCTA() {
  const { data: session, status } = useSession();
  const loading = status === "loading";

  if (loading) {
    return (
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
        <div className="h-14 w-72 rounded-2xl bg-white/[0.05] animate-pulse" />
        <div className="h-14 w-44 rounded-2xl bg-white/[0.04] animate-pulse" />
      </div>
    );
  }

  if (session?.user) {
    const role  = (session.user as { role?: string })?.role?.toLowerCase() ?? "creator";
    const name  = session.user.name?.split(" ")[0] ?? null;

    return (
      <div className="flex flex-col items-center gap-5 mb-14">
        {/* Welcome chip */}
        {name && (
          <p className="text-sm text-slate-400">
            Bon retour,{" "}
            <span className="text-slate-200 font-semibold">{name}</span> 👋
          </p>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href={`/dashboard/${role}`}
            className="group flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-pink-500 text-white font-semibold text-base hover:from-indigo-600 hover:to-pink-600 transition-all duration-200 hover:scale-[1.02] shadow-2xl shadow-indigo-500/30"
          >
            <LayoutDashboard size={18} />
            Mon Dashboard
            <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link
            href="/explorer"
            className="flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-white/[0.05] border border-white/[0.1] text-slate-300 font-medium text-base hover:bg-white/[0.08] hover:border-white/[0.18] hover:text-white transition-all duration-200"
          >
            <Play size={15} className="text-indigo-400" />
            Voir le classement
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
      <Link
        href="/auth/register"
        className="group flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-pink-500 text-white font-semibold text-base hover:from-indigo-600 hover:to-pink-600 transition-all duration-200 hover:scale-[1.02] shadow-2xl shadow-indigo-500/30"
      >
        Créer mon compte — c&apos;est gratuit
        <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
      </Link>
      <Link
        href="/explorer"
        className="flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-white/[0.05] border border-white/[0.1] text-slate-300 font-medium text-base hover:bg-white/[0.08] hover:border-white/[0.18] hover:text-white transition-all duration-200"
      >
        <Play size={15} className="text-indigo-400" />
        Voir le classement
      </Link>
    </div>
  );
}
