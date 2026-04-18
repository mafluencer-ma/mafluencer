"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Trophy, Flame, Wallet, Briefcase, ArrowRight,
  TrendingUp, Clock, ChevronRight, Star, RefreshCw,
} from "lucide-react";
import type { Session } from "next-auth";
import StatCard from "@/components/dashboard/stat-card";
import ScoreRing from "@/components/ui/score-ring";
import Badge from "@/components/ui/badge";
import CountdownTimer from "@/components/dashboard/countdown-timer";
import { cn, formatMAD, getLevelGradient, getScoreLevel, formatNumber } from "@/lib/utils";

type ActiveChallenge = {
  id: string;
  title: string;
  category: string;
  endDate: Date;
  submissionCount: number;
};

type RecentMission = {
  id: string;
  brand: string;
  budget: number;
  status: string;
  type: string;
};

type OverviewData = {
  score: number;
  level: string;
  challengesCompleted: number;
  earningsThisMonth: number;
  pendingMissions: number;
  activeChallenge: ActiveChallenge | null;
  recentMissions: RecentMission[];
};

const MISSION_STATUS_LABELS: Record<string, { label: string; variant: "success" | "warning" | "primary" | "default" }> = {
  PENDING:   { label: "En attente", variant: "warning" },
  ACCEPTED:  { label: "Acceptée",   variant: "primary" },
  DELIVERED: { label: "Livrée",     variant: "success" },
  PAID:      { label: "Payée",      variant: "success" },
};

export default function CreatorOverviewContent({ session }: { session: Session }) {
  const [data, setData]       = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const firstName = session.user?.name?.split(" ")[0] ?? "Creator";

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [meRes, challengesRes, missionsRes] = await Promise.all([
          fetch("/api/me"),
          fetch("/api/challenges?status=ACTIVE&limit=1"),
          fetch("/api/missions?limit=5"),
        ]);

        const meData         = meRes.ok         ? await meRes.json()         : null;
        const challengesData = challengesRes.ok  ? await challengesRes.json()  : null;
        const missionsData   = missionsRes.ok    ? await missionsRes.json()    : null;

        const profile  = meData?.creatorProfile;
        const missions = (missionsData?.missions ?? []) as Array<{
          id: string; title: string; budget: number; status: string; type: string;
          brand: { name: string; logo: string | null } | null;
        }>;
        const challenges = challengesData?.challenges ?? [];

        const pendingMissions = missions.filter((m) => m.status === "PENDING").length;
        const activeChallenge = challenges[0]
          ? {
              id:             challenges[0].id,
              title:          challenges[0].title,
              category:       challenges[0].category,
              endDate:        new Date(challenges[0].endDate),
              submissionCount:challenges[0].submissionCount ?? 0,
            }
          : null;

        const recentMissions: RecentMission[] = missions.slice(0, 4).map((m) => ({
          id:     m.id,
          brand:  m.brand?.name ?? "Marque",
          budget: m.budget,
          status: m.status,
          type:   m.type,
        }));

        setData({
          score:               profile?.score    ?? 0,
          level:               profile?.level    ?? "Rookie",
          challengesCompleted: 0,
          earningsThisMonth:   0,
          pendingMissions,
          activeChallenge,
          recentMissions,
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const score    = data?.score ?? 0;
  const level    = data?.level ?? getScoreLevel(score);
  const gradient = getLevelGradient(level);

  if (loading) {
    return (
      <div className="space-y-6 max-w-6xl">
        <div className="flex items-center gap-3">
          <div className="h-8 w-48 bg-slate-700/60 rounded-lg animate-pulse" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass rounded-[16px] p-5 animate-pulse">
              <div className="h-8 bg-slate-700/60 rounded w-20 mb-2" />
              <div className="h-3 bg-slate-700/40 rounded w-32" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-slate-100">
            Bonjour, {firstName} 👋
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            {new Date().toLocaleDateString("fr-MA", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>
        <Link
          href="/dashboard/creator/challenges"
          className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-[12px] bg-gradient-to-r from-indigo-500 to-pink-500 text-white text-sm font-medium hover:from-indigo-600 hover:to-pink-600 transition-all hover:scale-[1.02] shadow-lg shadow-indigo-500/20"
        >
          <Flame size={15} />
          Voir les défis
        </Link>
      </div>

      {/* ── Top stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Score card */}
        <div className="col-span-2 lg:col-span-1 glass rounded-[16px] p-5 flex items-center gap-4 relative overflow-hidden group hover:scale-[1.02] transition-all duration-200">
          <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-[0.06] group-hover:opacity-[0.1] transition-opacity`} />
          <ScoreRing score={score} size={80} strokeWidth={6} />
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Mafluencer Score</p>
            <div className={cn("text-xs font-bold bg-gradient-to-r bg-clip-text text-transparent", gradient)}>
              {level}
            </div>
          </div>
        </div>

        <StatCard
          label="Défis complétés"
          value={data?.challengesCompleted ?? 0}
          icon={Trophy}
          iconColor="text-amber-400"
        />
        <StatCard
          label="Revenus ce mois"
          value={formatMAD(data?.earningsThisMonth ?? 0)}
          icon={Wallet}
          iconColor="text-emerald-400"
        />
        <StatCard
          label="Missions en attente"
          value={data?.pendingMissions ?? 0}
          icon={Briefcase}
          iconColor="text-pink-400"
          sub={(data?.pendingMissions ?? 0) > 0 ? "Réponds vite !" : "Aucune en attente"}
        />
      </div>

      {/* ── Main grid ── */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Active challenge */}
        <div className="lg:col-span-2 glass rounded-[20px] p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-pink-500/5" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Flame size={16} className="text-orange-400" />
                <span className="text-sm font-semibold text-slate-300">Défi en cours</span>
              </div>
              {data?.activeChallenge && <Badge variant="warning">Actif</Badge>}
            </div>

            {data?.activeChallenge ? (
              <>
                <h3 className="text-xl font-heading font-bold text-slate-100 mb-1">
                  {data.activeChallenge.title}
                </h3>
                <p className="text-xs text-slate-500 mb-5">
                  {data.activeChallenge.submissionCount} soumissions · Catégorie {data.activeChallenge.category}
                </p>
                <div className="mb-6">
                  <p className="text-xs text-slate-600 mb-2 flex items-center gap-1">
                    <Clock size={11} /> Temps restant
                  </p>
                  <CountdownTimer endDate={data.activeChallenge.endDate} size="md" />
                </div>
                <Link
                  href={`/dashboard/creator/challenge/${data.activeChallenge.id}`}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-[12px] bg-gradient-to-r from-orange-500 to-pink-500 text-white text-sm font-semibold hover:from-orange-600 hover:to-pink-600 transition-all hover:scale-[1.01] shadow-lg shadow-orange-500/20"
                >
                  Soumettre ma vidéo
                  <ArrowRight size={15} />
                </Link>
              </>
            ) : (
              <div className="py-6 text-center">
                <p className="text-2xl mb-2">🎯</p>
                <p className="text-slate-500 text-sm">Aucun défi actif en ce moment</p>
                <p className="text-slate-600 text-xs mt-1">Reviens bientôt !</p>
              </div>
            )}
          </div>
        </div>

        {/* Score progression */}
        <div className="glass rounded-[20px] p-6">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp size={16} className="text-indigo-400" />
            <span className="text-sm font-semibold text-slate-300">Progression du score</span>
          </div>
          <div className="space-y-4">
            <div className="text-center py-4">
              <p className="text-4xl font-heading font-bold text-slate-100">{score}</p>
              <p className="text-xs text-slate-500 mt-1">points actuels</p>
            </div>
            {level !== "Legend" && (() => {
              const thresholds: Record<string, [number, number]> = {
                Rookie: [0, 200], Rising: [200, 400], Star: [400, 600], Elite: [600, 800],
              };
              const [min, max] = thresholds[level] ?? [0, 1000];
              const pct = ((score - min) / (max - min)) * 100;
              const nextLevel = level === "Rookie" ? "Rising" : level === "Rising" ? "Star" : level === "Star" ? "Elite" : "Legend";
              return (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>{level}</span>
                    <span>{nextLevel}</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${gradient} rounded-full transition-all duration-700`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-center text-slate-600">+{max - score} pts pour {nextLevel}</p>
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* ── Missions récentes ── */}
      <div className="glass rounded-[20px] p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Briefcase size={16} className="text-pink-400" />
            <span className="text-sm font-semibold text-slate-300">Missions récentes</span>
          </div>
          <Link href="/dashboard/creator/missions" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1">
            Voir tout <ChevronRight size={12} />
          </Link>
        </div>

        {(data?.recentMissions ?? []).length === 0 ? (
          <div className="py-6 text-center">
            <p className="text-2xl mb-2">📭</p>
            <p className="text-sm text-slate-600">Aucune mission pour l&apos;instant</p>
          </div>
        ) : (
          <div className="space-y-2">
            {(data?.recentMissions ?? []).map((m) => {
              const statusMeta = MISSION_STATUS_LABELS[m.status] ?? { label: m.status, variant: "default" as const };
              return (
                <Link key={m.id} href="/dashboard/creator/missions">
                  <div className="flex items-center gap-3 p-3 rounded-[12px] hover:bg-white/5 transition-colors group">
                    <div className="w-10 h-10 rounded-[10px] bg-amber-500/10 flex items-center justify-center flex-shrink-0 text-base">
                      🏢
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors truncate">
                        {m.brand}
                      </p>
                      <p className="text-xs text-slate-600">{m.type} · {formatMAD(m.budget)}</p>
                    </div>
                    <Badge variant={statusMeta.variant}>{statusMeta.label}</Badge>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
