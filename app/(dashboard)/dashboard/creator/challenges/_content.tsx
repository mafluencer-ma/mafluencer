"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Flame, Trophy, Clock, ArrowRight, CheckCircle, RefreshCw } from "lucide-react";
import Badge from "@/components/ui/badge";
import CountdownTimer from "@/components/dashboard/countdown-timer";
import EmptyState from "@/components/dashboard/empty-state";
import PageHeader from "@/components/dashboard/page-header";
import { cn } from "@/lib/utils";

type Challenge = {
  id: string;
  title: string;
  category: string;
  description: string;
  type: string;
  endDate: Date;
  submissionCount: number;
  prizeAmount: number | null;
  rules: string;
  brand: { name: string; logo: string | null } | null;
};

type PastChallenge = {
  id: string;
  title: string;
  category: string;
  completedAt: string;
  score: number;
  rank: number | null;
  submissionsTotal: number;
};

const TABS = ["En cours", "Historique"] as const;
type Tab = typeof TABS[number];

const RANK_MEDALS: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

const CATEGORY_COLORS: Record<string, string> = {
  Humour:    "from-orange-500 to-yellow-500",
  Food:      "from-green-500 to-emerald-500",
  Beauté:    "from-pink-500 to-rose-500",
  Lifestyle: "from-purple-500 to-indigo-500",
  Tech:      "from-blue-500 to-cyan-500",
  Sport:     "from-red-500 to-orange-500",
};

export default function ChallengesContent() {
  const [tab, setTab]                   = useState<Tab>("En cours");
  const [active, setActive]             = useState<Challenge[]>([]);
  const [past, setPast]                 = useState<PastChallenge[]>([]);
  const [loading, setLoading]           = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    async function loadActive() {
      setLoading(true);
      try {
        const res  = await fetch("/api/challenges?status=ACTIVE&limit=20");
        const data = res.ok ? await res.json() : null;
        const raw  = data?.challenges ?? [];
        setActive(raw.map((c: Record<string, unknown>) => ({
          id:             c.id,
          title:          c.title,
          category:       c.category,
          description:    c.description,
          type:           c.type,
          endDate:        new Date(c.endDate as string),
          submissionCount:c.submissionCount ?? 0,
          prizeAmount:    c.prizeAmount ?? null,
          rules:          c.rules ?? "",
          brand:          c.brand ?? null,
        })));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadActive();
  }, []);

  async function loadHistory() {
    if (past.length > 0) return;
    setHistoryLoading(true);
    try {
      const res  = await fetch("/api/challenges?status=COMPLETED&limit=20");
      const data = res.ok ? await res.json() : null;
      const raw  = data?.challenges ?? [];
      setPast(raw.map((c: Record<string, unknown>, i: number) => ({
        id:             c.id,
        title:          c.title,
        category:       c.category,
        completedAt:    c.endDate ? new Date(c.endDate as string).toLocaleDateString("fr-FR", { month: "short", year: "2-digit" }) : "—",
        score:          0,
        rank:           null,
        submissionsTotal:(c.submissionCount as number) ?? 0,
      })));
    } catch (e) {
      console.error(e);
    } finally {
      setHistoryLoading(false);
    }
  }

  function handleTabChange(t: Tab) {
    setTab(t);
    if (t === "Historique") loadHistory();
  }

  return (
    <div className="max-w-4xl space-y-6">
      <PageHeader
        title="Défis"
        subtitle="Relève les défis de la semaine et consulte tes performances passées"
        icon={Flame}
      />

      {/* Tabs */}
      <div className="flex gap-1 p-1 glass rounded-[14px] w-fit">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => handleTabChange(t)}
            className={cn(
              "px-5 py-2.5 rounded-[10px] text-sm font-medium transition-all",
              tab === t ? "bg-indigo-500/20 text-indigo-300" : "text-slate-500 hover:text-slate-300"
            )}
          >
            {t}
            {t === "En cours" && !loading && active.length > 0 && (
              <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400">
                {active.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── En cours ── */}
      {tab === "En cours" && (
        <div className="space-y-4">
          {loading ? (
            Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="glass rounded-[20px] p-6 animate-pulse">
                <div className="h-5 bg-slate-700/60 rounded w-64 mb-3" />
                <div className="h-3 bg-slate-700/40 rounded w-full mb-2" />
                <div className="h-3 bg-slate-700/40 rounded w-3/4" />
              </div>
            ))
          ) : active.length === 0 ? (
            <EmptyState
              emoji="🎯"
              title="Aucun défi actif"
              description="Reviens la semaine prochaine pour de nouveaux défis !"
            />
          ) : (
            active.map((ch) => {
              const catGrad = CATEGORY_COLORS[ch.category] ?? "from-indigo-500 to-pink-500";
              const rulesArr = ch.rules.split("\n").filter(Boolean).slice(0, 4);
              return (
                <div key={ch.id} className="glass rounded-[20px] overflow-hidden">
                  <div className={`h-1.5 bg-gradient-to-r ${catGrad}`} />
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="text-lg font-heading font-bold text-slate-100">{ch.title}</h3>
                          {ch.type === "SPONSORED" && <Badge variant="warning">Sponsorisé</Badge>}
                        </div>
                        <Badge variant="primary">{ch.category}</Badge>
                        {ch.brand && (
                          <span className="text-xs text-slate-600 ml-2">par {ch.brand.name}</span>
                        )}
                      </div>
                      {ch.prizeAmount && (
                        <div className="flex-shrink-0 text-right">
                          <p className="text-lg font-heading font-bold text-amber-400">{ch.prizeAmount} MAD</p>
                          <p className="text-xs text-slate-600">Prix total</p>
                        </div>
                      )}
                    </div>

                    <p className="text-slate-500 text-sm leading-relaxed mb-5">{ch.description}</p>

                    {rulesArr.length > 0 && (
                      <ul className="space-y-1.5 mb-5">
                        {rulesArr.map((r, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-slate-500">
                            <span className="text-indigo-500 mt-0.5 flex-shrink-0">›</span>
                            {r}
                          </li>
                        ))}
                      </ul>
                    )}

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-white/[0.08]">
                      <div className="space-y-1">
                        <p className="text-xs text-slate-600 flex items-center gap-1">
                          <Clock size={11} /> Temps restant
                        </p>
                        <CountdownTimer endDate={ch.endDate} size="sm" />
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-600">{ch.submissionCount} soumissions</span>
                        <Link
                          href={`/dashboard/creator/challenge/${ch.id}`}
                          className={cn(
                            "flex items-center gap-2 px-5 py-2.5 rounded-[12px] text-sm font-semibold transition-all hover:scale-[1.01]",
                            `bg-gradient-to-r ${catGrad} text-white shadow-md`
                          )}
                        >
                          Participer
                          <ArrowRight size={14} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ── Historique ── */}
      {tab === "Historique" && (
        <div className="space-y-3">
          {historyLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="glass rounded-[16px] p-5 animate-pulse flex gap-4">
                <div className="w-10 h-10 bg-slate-700/60 rounded" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-slate-700/60 rounded w-48" />
                  <div className="h-2.5 bg-slate-700/40 rounded w-32" />
                </div>
              </div>
            ))
          ) : past.length === 0 ? (
            <EmptyState
              emoji="📜"
              title="Pas encore de défis complétés"
              description="Participe à un défi pour voir ton historique ici."
              action={{ label: "Voir les défis actifs", onClick: () => handleTabChange("En cours") }}
            />
          ) : (
            past.map((ch) => {
              const catGrad = CATEGORY_COLORS[ch.category] ?? "from-indigo-500 to-pink-500";
              return (
                <div key={ch.id} className="glass rounded-[16px] p-5 flex items-center gap-4 hover:scale-[1.01] transition-all group">
                  <div className="text-2xl flex-shrink-0 w-10 text-center">
                    {ch.rank ? (RANK_MEDALS[ch.rank] ?? `#${ch.rank}`) : "—"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-200 group-hover:text-white transition-colors truncate">
                      {ch.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge variant="primary">{ch.category}</Badge>
                      <span className="text-xs text-slate-600">{ch.completedAt}</span>
                      <span className="text-xs text-slate-600">·</span>
                      <span className="text-xs text-slate-600">{ch.submissionsTotal} participants</span>
                    </div>
                  </div>
                  {ch.score > 0 && (
                    <div className="flex-shrink-0 text-right">
                      <div className="flex items-center gap-1.5">
                        <div className="h-1.5 w-14 bg-slate-800 rounded-full overflow-hidden">
                          <div className={`h-full bg-gradient-to-r ${catGrad} rounded-full`} style={{ width: `${ch.score}%` }} />
                        </div>
                        <span className="text-sm font-bold text-slate-200">{ch.score}</span>
                      </div>
                      <p className="text-[10px] text-slate-600 mt-0.5">Score / 100</p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
