"use client";

import { useState } from "react";
import Link from "next/link";
import { Flame, Trophy, Clock, ChevronRight, ArrowRight, CheckCircle } from "lucide-react";
import Badge from "@/components/ui/badge";
import CountdownTimer from "@/components/dashboard/countdown-timer";
import EmptyState from "@/components/dashboard/empty-state";
import PageHeader from "@/components/dashboard/page-header";
import { cn, getScoreLevel, getLevelGradient } from "@/lib/utils";

const ACTIVE_CHALLENGES = [
  {
    id: "ch-12",
    title: "Défi Humour du Ramadan",
    category: "Humour",
    description: "Crée une vidéo humoristique sur le thème du Ramadan. Sois créatif, authentique, et fais rire ta communauté !",
    type: "FREE",
    endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    submissions: 48,
    prizeAmount: null,
    hasSubmitted: false,
    rules: ["Vidéo TikTok ou Reel minimum 30s", "Hashtag #MafluenceurRamadan obligatoire", "Contenu original, pas de recyclage"],
  },
  {
    id: "ch-13",
    title: "Challenge Food Fusion Maroc",
    category: "Food",
    description: "Invente une recette qui fusionne la cuisine marocaine traditionnelle avec un style international. Montre le résultat !",
    type: "SPONSORED",
    endDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
    submissions: 23,
    prizeAmount: 2000,
    hasSubmitted: true,
    sponsor: "Marjane Market",
    rules: ["Recette filmée en cuisine", "Ingrédients Marjane visibles", "Min 45 secondes"],
  },
];

const PAST_CHALLENGES = [
  { id: "ch-11", title: "Défi Lifestyle Hiver", category: "Lifestyle", completedAt: "Fév 2025", rank: 2, score: 87, submissionsTotal: 62 },
  { id: "ch-10", title: "Viral Challenge #Maroc", category: "Humour", completedAt: "Jan 2025", rank: 5, score: 74, submissionsTotal: 89 },
  { id: "ch-9", title: "Beauty Routine Locale", category: "Beauté", completedAt: "Déc 2024", rank: 1, score: 96, submissionsTotal: 41 },
  { id: "ch-8", title: "Tech Review 2024", category: "Tech", completedAt: "Nov 2024", rank: 3, score: 81, submissionsTotal: 28 },
  { id: "ch-7", title: "Sport Challenge Ramadan", category: "Sport", completedAt: "Oct 2024", rank: 8, score: 68, submissionsTotal: 73 },
];

const TABS = ["En cours", "Historique"] as const;
type Tab = typeof TABS[number];

const RANK_MEDALS: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

const CATEGORY_COLORS: Record<string, string> = {
  Humour: "from-orange-500 to-yellow-500",
  Food: "from-green-500 to-emerald-500",
  Beauté: "from-pink-500 to-rose-500",
  Lifestyle: "from-purple-500 to-indigo-500",
  Tech: "from-blue-500 to-cyan-500",
  Sport: "from-red-500 to-orange-500",
};

export default function ChallengesContent() {
  const [tab, setTab] = useState<Tab>("En cours");

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
            onClick={() => setTab(t)}
            className={cn(
              "px-5 py-2.5 rounded-[10px] text-sm font-medium transition-all",
              tab === t ? "bg-indigo-500/20 text-indigo-300" : "text-slate-500 hover:text-slate-300"
            )}
          >
            {t}
            {t === "En cours" && (
              <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400">
                {ACTIVE_CHALLENGES.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── En cours ── */}
      {tab === "En cours" && (
        <div className="space-y-4">
          {ACTIVE_CHALLENGES.length === 0 ? (
            <EmptyState
              emoji="🎯"
              title="Aucun défi actif"
              description="Reviens la semaine prochaine pour de nouveaux défis !"
            />
          ) : (
            ACTIVE_CHALLENGES.map((ch) => {
              const catGrad = CATEGORY_COLORS[ch.category] ?? "from-indigo-500 to-pink-500";
              return (
                <div key={ch.id} className="glass rounded-[20px] overflow-hidden">
                  {/* Top gradient strip */}
                  <div className={`h-1.5 bg-gradient-to-r ${catGrad}`} />

                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="text-lg font-heading font-bold text-slate-100">{ch.title}</h3>
                          {ch.type === "SPONSORED" && (
                            <Badge variant="warning">Sponsorisé</Badge>
                          )}
                          {ch.hasSubmitted && (
                            <Badge variant="success">
                              <CheckCircle size={11} /> Soumis
                            </Badge>
                          )}
                        </div>
                        <Badge variant="primary">{ch.category}</Badge>
                        {ch.sponsor && (
                          <span className="text-xs text-slate-600 ml-2">par {ch.sponsor}</span>
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

                    {/* Rules */}
                    <ul className="space-y-1.5 mb-5">
                      {ch.rules.map((r) => (
                        <li key={r} className="flex items-start gap-2 text-xs text-slate-500">
                          <span className="text-indigo-500 mt-0.5 flex-shrink-0">›</span>
                          {r}
                        </li>
                      ))}
                    </ul>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-white/8">
                      <div className="space-y-1">
                        <p className="text-xs text-slate-600 flex items-center gap-1">
                          <Clock size={11} /> Temps restant
                        </p>
                        <CountdownTimer endDate={ch.endDate} size="sm" />
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-600">{ch.submissions} soumissions</span>
                        <Link
                          href={`/dashboard/creator/challenge/${ch.id}`}
                          className={cn(
                            "flex items-center gap-2 px-5 py-2.5 rounded-[12px] text-sm font-semibold transition-all hover:scale-[1.01]",
                            ch.hasSubmitted
                              ? "glass border border-white/10 text-slate-300 hover:border-white/20"
                              : `bg-gradient-to-r ${catGrad} text-white shadow-md`
                          )}
                        >
                          {ch.hasSubmitted ? "Voir ma soumission" : "Participer"}
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
          {PAST_CHALLENGES.length === 0 ? (
            <EmptyState
              emoji="📜"
              title="Pas encore de défis complétés"
              description="Participe à un défi pour voir ton historique ici."
              action={{ label: "Voir les défis actifs", onClick: () => setTab("En cours") }}
            />
          ) : (
            PAST_CHALLENGES.map((ch) => {
              const catGrad = CATEGORY_COLORS[ch.category] ?? "from-indigo-500 to-pink-500";
              const levelStr = getScoreLevel(ch.score * 10);
              return (
                <div key={ch.id} className="glass rounded-[16px] p-5 flex items-center gap-4 hover:scale-[1.01] transition-all group">
                  {/* Rank */}
                  <div className="text-2xl flex-shrink-0 w-10 text-center">
                    {RANK_MEDALS[ch.rank] ?? `#${ch.rank}`}
                  </div>

                  {/* Info */}
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

                  {/* Score */}
                  <div className="flex-shrink-0 text-right">
                    <div className="flex items-center gap-1.5">
                      <div className="h-1.5 w-14 bg-slate-800 rounded-full overflow-hidden">
                        <div className={`h-full bg-gradient-to-r ${catGrad} rounded-full`} style={{ width: `${ch.score}%` }} />
                      </div>
                      <span className="text-sm font-bold text-slate-200">{ch.score}</span>
                    </div>
                    <p className="text-[10px] text-slate-600 mt-0.5">Score / 100</p>
                  </div>
                </div>
              );
            })
          )}

          {/* Total score earned */}
          <div className="glass rounded-[16px] p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy size={16} className="text-amber-400" />
              <span className="text-sm text-slate-400">Score total gagné via les défis</span>
            </div>
            <span className="font-heading font-bold text-amber-400">
              +{PAST_CHALLENGES.reduce((a, c) => a + c.score, 0)} pts
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
