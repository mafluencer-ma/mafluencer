"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Flame, PlusCircle, Trophy, Clock, CheckCircle,
  Users, Calendar, RefreshCw, BarChart2,
} from "lucide-react";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import EmptyState from "@/components/dashboard/empty-state";
import PageHeader from "@/components/dashboard/page-header";
import { cn, formatMAD } from "@/lib/utils";
import toast from "react-hot-toast";

type ChallengeStatus = "DRAFT" | "ACTIVE" | "VOTING" | "COMPLETED";

type Challenge = {
  id:              string;
  title:           string;
  description:     string;
  category:        string;
  status:          ChallengeStatus;
  startDate:       string;
  endDate:         string;
  prizeAmount:     number | null;
  submissionCount: number;
};

const STATUS_META: Record<ChallengeStatus, { label: string; variant: "warning" | "primary" | "success" | "error" | "default"; icon: typeof Clock }> = {
  DRAFT:     { label: "Brouillon",   variant: "default",  icon: Clock },
  ACTIVE:    { label: "Actif",       variant: "primary",  icon: CheckCircle },
  VOTING:    { label: "Vote",        variant: "warning",  icon: BarChart2 },
  COMPLETED: { label: "Terminé",    variant: "success",  icon: Trophy },
};

const CATEGORY_GRADIENTS: Record<string, string> = {
  Humour:    "from-orange-500 to-yellow-500",
  Food:      "from-green-500 to-emerald-500",
  Beauté:    "from-pink-500 to-rose-500",
  Lifestyle: "from-purple-500 to-indigo-500",
  Tech:      "from-blue-500 to-cyan-500",
  Sport:     "from-red-500 to-orange-500",
  Mode:      "from-fuchsia-500 to-pink-500",
  Gaming:    "from-violet-500 to-indigo-500",
  Voyage:    "from-teal-500 to-cyan-500",
};

function fmt(date: string) {
  return new Date(date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "2-digit" });
}

export default function BrandChallengesContent() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading,    setLoading]    = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/challenges?mine=true&status=all&limit=50");
      const data = res.ok ? await res.json() : null;
      setChallenges(data?.challenges ?? []);
    } catch {
      toast.error("Impossible de charger les défis");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const active    = challenges.filter((c) => c.status === "ACTIVE").length;
  const completed = challenges.filter((c) => c.status === "COMPLETED").length;
  const draft     = challenges.filter((c) => c.status === "DRAFT").length;

  return (
    <div className="max-w-5xl space-y-6">
      <PageHeader
        title="Mes défis"
        subtitle="Lance des challenges sponsorisés pour engager la communauté"
        icon={Flame}
        action={
          <div className="flex items-center gap-2">
            <button onClick={load} disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-xs text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all disabled:opacity-50">
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
              Actualiser
            </button>
            <Link href="/dashboard/brand/challenges/new">
              <Button variant="primary"><PlusCircle size={15} /> Créer un défi</Button>
            </Link>
          </div>
        }
      />

      {/* Summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total",     value: challenges.length, color: "text-slate-300" },
          { label: "Actifs",    value: active,            color: "text-indigo-400" },
          { label: "Terminés",  value: completed,         color: "text-emerald-400" },
          { label: "Brouillons",value: draft,             color: "text-slate-500"  },
        ].map(({ label, value, color }) => (
          <div key={label} className="glass rounded-[14px] p-4 text-center">
            <p className={cn("text-2xl font-heading font-bold", color)}>{loading ? "—" : value}</p>
            <p className="text-xs text-slate-600 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Challenges list */}
      <div className="glass rounded-[20px] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08]">
          <p className="text-sm font-semibold text-slate-300">Défis sponsorisés</p>
          <span className="text-xs text-slate-600">{challenges.length} défi{challenges.length !== 1 ? "s" : ""}</span>
        </div>

        {loading ? (
          <div className="divide-y divide-white/5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4 animate-pulse">
                <div className="w-10 h-10 rounded-[10px] bg-slate-700/60 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-slate-700/60 rounded w-40" />
                  <div className="h-2.5 bg-slate-700/40 rounded w-56" />
                </div>
              </div>
            ))}
          </div>
        ) : challenges.length === 0 ? (
          <div className="p-8">
            <EmptyState
              emoji="🔥"
              title="Aucun défi encore"
              description="Lance ton premier challenge sponsorisé pour engager les creators"
              action={{ label: "Créer un défi", href: "/dashboard/brand/challenges/new" }}
            />
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {challenges.map((c) => {
              const statusMeta = STATUS_META[c.status] ?? STATUS_META.DRAFT;
              const StatusIcon = statusMeta.icon;
              const grad = CATEGORY_GRADIENTS[c.category] ?? "from-indigo-500 to-pink-500";

              return (
                <div key={c.id} className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors">
                  <div className={cn("w-10 h-10 rounded-[10px] bg-gradient-to-br flex-shrink-0", grad)} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-200 truncate">{c.title}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      <span className="text-xs text-slate-600">{c.category}</span>
                      <span className="text-slate-700">·</span>
                      <span className="flex items-center gap-1 text-xs text-slate-600">
                        <Calendar size={10} /> {fmt(c.startDate)} → {fmt(c.endDate)}
                      </span>
                      <span className="text-slate-700">·</span>
                      <span className="flex items-center gap-1 text-xs text-slate-600">
                        <Users size={10} /> {c.submissionCount} soumission{c.submissionCount !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {c.prizeAmount && (
                      <span className="text-sm font-bold text-amber-400 tabular-nums hidden sm:block">
                        {formatMAD(c.prizeAmount)}
                      </span>
                    )}
                    <Badge variant={statusMeta.variant}>
                      <StatusIcon size={10} />{statusMeta.label}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
