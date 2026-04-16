"use client";

import Link from "next/link";
import {
  Trophy, Flame, Wallet, Briefcase, ArrowRight,
  TrendingUp, Clock, ChevronRight, Star,
} from "lucide-react";
import type { Session } from "next-auth";
import StatCard from "@/components/dashboard/stat-card";
import ScoreRing from "@/components/ui/score-ring";
import Badge from "@/components/ui/badge";
import CountdownTimer from "@/components/dashboard/countdown-timer";
import { cn, formatMAD, getLevelGradient, getScoreLevel, formatNumber } from "@/lib/utils";

// Mock data — will be fetched from Prisma
const MOCK_DATA = {
  score: 347,
  challengesCompleted: 6,
  earningsThisMonth: 1200,
  pendingMissions: 2,
  activeChallenge: {
    id: "ch-12",
    title: "Défi Humour du Ramadan",
    category: "Humour",
    endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000),
    submissionsCount: 48,
  },
  recentMissions: [
    { id: "m1", brand: "Jumia Maroc", budget: 1500, status: "PENDING", type: "VIDEO" },
    { id: "m2", brand: "Marjane", budget: 800, status: "ACCEPTED", type: "POST" },
  ],
  scoreHistory: [320, 325, 330, 338, 340, 347],
  weeklyActivity: [3, 5, 2, 7, 4, 6, 5],
  recentActivity: [
    { emoji: "🏆", text: "Tu as complété le défi #Lifestyle", time: "Il y a 2h" },
    { emoji: "💰", text: "Paiement reçu de Inwi — 1 200 MAD", time: "Hier" },
    { emoji: "📩", text: "Nouvelle mission de Marjane Market", time: "Il y a 2j" },
    { emoji: "⭐", text: "Ton score a augmenté de +27 pts", time: "Il y a 3j" },
  ],
};

const MISSION_STATUS_LABELS: Record<string, { label: string; variant: "success" | "warning" | "primary" | "default" }> = {
  PENDING: { label: "En attente", variant: "warning" },
  ACCEPTED: { label: "Acceptée", variant: "primary" },
  DELIVERED: { label: "Livrée", variant: "success" },
  PAID: { label: "Payée", variant: "success" },
};

export default function CreatorOverviewContent({ session }: { session: Session }) {
  const d = MOCK_DATA;
  const level = getScoreLevel(d.score);
  const gradient = getLevelGradient(level);
  const firstName = session.user?.name?.split(" ")[0] ?? "Creator";

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
        {/* Score card special */}
        <div className="col-span-2 lg:col-span-1 glass rounded-[16px] p-5 flex items-center gap-4 relative overflow-hidden group hover:scale-[1.02] transition-all duration-200">
          <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-[0.06] group-hover:opacity-[0.1] transition-opacity`} />
          <ScoreRing score={d.score} size={80} strokeWidth={6} />
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Mafluencer Score</p>
            <div className={cn("text-xs font-bold bg-gradient-to-r bg-clip-text text-transparent", gradient)}>
              {level}
            </div>
            <p className="text-[10px] text-slate-700 mt-1">Top 15% cette semaine</p>
          </div>
        </div>

        <StatCard
          label="Défis complétés"
          value={d.challengesCompleted}
          icon={Trophy}
          iconColor="text-amber-400"
          trend={{ value: "+2 ce mois", up: true }}
        />
        <StatCard
          label="Revenus ce mois"
          value={formatMAD(d.earningsThisMonth)}
          icon={Wallet}
          iconColor="text-emerald-400"
          trend={{ value: "+40%", up: true }}
        />
        <StatCard
          label="Missions en attente"
          value={d.pendingMissions}
          icon={Briefcase}
          iconColor="text-pink-400"
          sub={d.pendingMissions > 0 ? "Réponds vite !" : "Aucune en attente"}
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
              <Badge variant="warning">Actif</Badge>
            </div>

            <h3 className="text-xl font-heading font-bold text-slate-100 mb-1">
              {d.activeChallenge.title}
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              {d.activeChallenge.submissionsCount} soumissions · Catégorie {d.activeChallenge.category}
            </p>

            <div className="mb-6">
              <p className="text-xs text-slate-600 mb-2 flex items-center gap-1">
                <Clock size={11} /> Temps restant
              </p>
              <CountdownTimer endDate={d.activeChallenge.endDate} size="md" />
            </div>

            <Link
              href={`/dashboard/creator/challenge/${d.activeChallenge.id}`}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-[12px] bg-gradient-to-r from-orange-500 to-pink-500 text-white text-sm font-semibold hover:from-orange-600 hover:to-pink-600 transition-all hover:scale-[1.01] shadow-lg shadow-orange-500/20"
            >
              Soumettre ma vidéo
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>

        {/* Score evolution */}
        <div className="glass rounded-[20px] p-6">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp size={16} className="text-indigo-400" />
            <span className="text-sm font-semibold text-slate-300">Évolution du score</span>
          </div>
          <MiniLineChart data={d.scoreHistory} />
          <div className="mt-4 pt-4 border-t border-white/8">
            <div className="flex justify-between text-xs">
              <span className="text-slate-600">Il y a 6 semaines</span>
              <span className="text-slate-600">Aujourd&apos;hui</span>
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-sm font-semibold text-slate-400">{d.scoreHistory[0]} pts</span>
              <span className="text-sm font-semibold text-emerald-400">+{d.score - d.scoreHistory[0]} pts</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Missions + Activity ── */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Recent missions */}
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

          {d.recentMissions.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-2xl mb-2">📭</p>
              <p className="text-sm text-slate-600">Aucune mission pour l&apos;instant</p>
            </div>
          ) : (
            <div className="space-y-3">
              {d.recentMissions.map((m) => {
                const statusMeta = MISSION_STATUS_LABELS[m.status];
                return (
                  <Link key={m.id} href={`/dashboard/creator/missions`}>
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

        {/* Activity feed */}
        <div className="glass rounded-[20px] p-6">
          <div className="flex items-center gap-2 mb-5">
            <Star size={16} className="text-amber-400" />
            <span className="text-sm font-semibold text-slate-300">Activité récente</span>
          </div>
          <div className="space-y-1">
            {d.recentActivity.map(({ emoji, text, time }, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-[10px] hover:bg-white/5 transition-colors">
                <span className="text-lg flex-shrink-0 mt-0.5">{emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-300 leading-snug">{text}</p>
                  <p className="text-xs text-slate-700 mt-0.5">{time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Score progression bar ── */}
      <div className="glass rounded-[20px] p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-semibold text-slate-300">Progression vers le niveau suivant</p>
            <p className="text-xs text-slate-600 mt-0.5">
              {level === "Rookie" && "Rising à 200 pts"}
              {level === "Rising" && "Star à 400 pts"}
              {level === "Star" && "Elite à 600 pts"}
              {level === "Elite" && "Legend à 800 pts"}
              {level === "Legend" && "Score maximum atteint 🏆"}
            </p>
          </div>
          <div className="text-right">
            <span className={cn("text-sm font-bold bg-gradient-to-r bg-clip-text text-transparent", gradient)}>
              {level}
            </span>
          </div>
        </div>

        {level !== "Legend" && (() => {
          const thresholds: Record<string, [number, number]> = {
            Rookie: [0, 200], Rising: [200, 400], Star: [400, 600], Elite: [600, 800],
          };
          const [min, max] = thresholds[level] ?? [0, 1000];
          const pct = ((d.score - min) / (max - min)) * 100;
          return (
            <div className="space-y-2">
              <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${gradient} rounded-full transition-all duration-700`}
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-slate-600">
                <span>{d.score} pts actuels</span>
                <span>
                  +{max - d.score} pts pour {
                    level === "Rookie" ? "Rising" :
                    level === "Rising" ? "Star" :
                    level === "Star" ? "Elite" : "Legend"
                  }
                </span>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

// ── Inline mini chart ──
function MiniLineChart({ data }: { data: number[] }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 200;
  const h = 60;
  const padX = 8;
  const stepX = (w - padX * 2) / (data.length - 1);

  const points = data.map((v, i) => {
    const x = padX + i * stepX;
    const y = h - ((v - min) / range) * (h - 12) - 6;
    return `${x},${y}`;
  });

  const polyline = points.join(" ");
  const area = `${padX},${h} ${polyline} ${padX + (data.length - 1) * stepX},${h}`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-16" preserveAspectRatio="none">
      <defs>
        <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366F1" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill="url(#chartFill)" />
      <polyline points={polyline} fill="none" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((_, i) => {
        const [x, y] = points[i].split(",").map(Number);
        return <circle key={i} cx={x} cy={y} r="2.5" fill="#6366F1" />;
      })}
    </svg>
  );
}
