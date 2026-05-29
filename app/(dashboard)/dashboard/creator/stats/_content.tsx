"use client";

import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import {
  BarChart3, Eye, Heart, Trophy, Wallet, TrendingUp,
  Briefcase, CheckCircle, Clock, Star, Zap, Share2,
} from "lucide-react";
import StatCard from "@/components/dashboard/stat-card";
import ScoreRing from "@/components/ui/score-ring";
import PageHeader from "@/components/dashboard/page-header";
import Badge from "@/components/ui/badge";
import { cn, formatMAD, formatNumber, getLevelGradient } from "@/lib/utils";

type ChartEntry = { name: string; views: number; likes: number; score: number; category: string };
type BestSubmission = { views: number; likes: number; challenge: string; category: string; platform: string; score: number } | null;

type StatsData = {
  profile: { score: number; level: string; followersCount: number; engagementRate: number; niches: string[] };
  submissions: {
    total: number; approved: number;
    totalViews: number; totalLikes: number; totalShares: number; totalComments: number; totalSaves: number;
    chart: ChartEntry[];
    best: BestSubmission;
  };
  missions: { total: number; totalEarned: number; byStatus: Record<string, number> };
};

const MISSION_STATUS = [
  { key: "PENDING",   label: "En attente", color: "#F59E0B" },
  { key: "ACCEPTED",  label: "Acceptée",   color: "#6366F1" },
  { key: "DELIVERED", label: "Livrée",     color: "#3B82F6" },
  { key: "PAID",      label: "Payée",      color: "#10B981" },
];

const BAR_COLORS = ["#6366F1", "#EC4899", "#8B5CF6", "#F59E0B", "#10B981", "#3B82F6"];

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-[12px] px-3 py-2 text-xs border border-white/10 shadow-lg">
      <p className="text-slate-300 font-medium mb-1 truncate max-w-[140px]">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="font-semibold">
          {p.name === "views" ? "👁 " : "❤️ "}{formatNumber(p.value)}
        </p>
      ))}
    </div>
  );
}

function StatBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-slate-400">{label}</span>
        <span className="text-slate-300 font-semibold">{value}</span>
      </div>
      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

export default function CreatorStatsContent() {
  const [data,    setData]    = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/me/stats")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => setData(d ?? null))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const score    = data?.profile.score    ?? 0;
  const level    = data?.profile.level    ?? "Rookie";
  const gradient = getLevelGradient(level);

  const levelThresholds: Record<string, [number, number]> = {
    Rookie: [0, 200], Rising: [200, 400], Star: [400, 600], Elite: [600, 800], Legend: [800, 1000],
  };
  const [lMin, lMax] = levelThresholds[level] ?? [0, 1000];
  const levelPct = Math.min(100, Math.round(((score - lMin) / (lMax - lMin)) * 100));

  const nextLevelMap: Record<string, string> = {
    Rookie: "Rising", Rising: "Star", Star: "Elite", Elite: "Legend",
  };
  const nextLevel = nextLevelMap[level] ?? null;

  const totalMissions = Object.values(data?.missions.byStatus ?? {}).reduce((a, v) => a + v, 0);

  if (loading) {
    return (
      <div className="max-w-5xl space-y-6">
        <div className="h-8 w-56 bg-slate-700/60 rounded-lg animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass rounded-[16px] p-5 animate-pulse h-28" />
          ))}
        </div>
        <div className="glass rounded-[20px] p-6 animate-pulse h-64" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-6">
      <PageHeader
        title="Statistiques"
        subtitle="Performance, engagement et progression"
        icon={BarChart3}
      />

      {/* ── KPI cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Score */}
        <div className={cn(
          "col-span-2 lg:col-span-1 glass rounded-[16px] p-5 flex items-center gap-4 relative overflow-hidden group hover:scale-[1.02] transition-all duration-200"
        )}>
          <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-[0.06] group-hover:opacity-[0.10] transition-opacity`} />
          <ScoreRing score={score} size={76} strokeWidth={6} />
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Mafluencer Score</p>
            <p className={cn("text-xs font-bold bg-gradient-to-r bg-clip-text text-transparent", gradient)}>{level}</p>
            <p className="text-[11px] text-slate-600 mt-0.5">{score} pts</p>
          </div>
        </div>

        <StatCard
          label="Soumissions totales"
          value={data?.submissions.total ?? 0}
          icon={Trophy}
          iconColor="text-amber-400"
          sub={`${data?.submissions.approved ?? 0} approuvées`}
        />
        <StatCard
          label="Vues cumulées"
          value={formatNumber(data?.submissions.totalViews ?? 0)}
          icon={Eye}
          iconColor="text-blue-400"
          sub="Toutes soumissions"
        />
        <StatCard
          label="Revenus missions"
          value={formatMAD(data?.missions.totalEarned ?? 0)}
          icon={Wallet}
          iconColor="text-emerald-400"
          sub={`${data?.missions.total ?? 0} missions reçues`}
        />
      </div>

      {/* ── Engagement metrics ── */}
      <div className="grid sm:grid-cols-4 gap-3">
        {[
          { icon: Heart,  label: "Likes",       value: formatNumber(data?.submissions.totalLikes    ?? 0), color: "text-pink-400",    bg: "bg-pink-500/10" },
          { icon: Share2, label: "Partages",     value: formatNumber(data?.submissions.totalShares   ?? 0), color: "text-indigo-400",  bg: "bg-indigo-500/10" },
          { icon: Star,   label: "Commentaires", value: formatNumber(data?.submissions.totalComments ?? 0), color: "text-amber-400",   bg: "bg-amber-500/10" },
          { icon: Zap,    label: "Saves",        value: formatNumber(data?.submissions.totalSaves    ?? 0), color: "text-emerald-400", bg: "bg-emerald-500/10" },
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className="glass rounded-[16px] p-4 flex items-center gap-3 hover:scale-[1.02] transition-all duration-200">
            <div className={cn("w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0", bg)}>
              <Icon size={16} className={color} />
            </div>
            <div>
              <p className="text-lg font-heading font-bold text-slate-100">{value}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Chart + Level progression ── */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Bar chart */}
        <div className="lg:col-span-2 glass rounded-[20px] p-6">
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 size={15} className="text-indigo-400" />
            <span className="text-sm font-semibold text-slate-300">Performance des soumissions</span>
            <div className="ml-auto flex items-center gap-3 text-xs text-slate-600">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-indigo-500 inline-block" />Vues</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-pink-500 inline-block" />Likes</span>
            </div>
          </div>
          {(data?.submissions.chart ?? []).length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center text-center">
              <p className="text-3xl mb-2">📊</p>
              <p className="text-slate-400 text-sm font-medium">Aucune soumission encore</p>
              <p className="text-slate-600 text-xs mt-1">Participe à un défi pour voir tes stats</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data?.submissions.chart} barGap={3} barCategoryGap="30%">
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#64748B" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#64748B" }} axisLine={false} tickLine={false} tickFormatter={(v) => formatNumber(v)} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                <Bar dataKey="views" name="views" radius={[4, 4, 0, 0]}>
                  {(data?.submissions.chart ?? []).map((_, i) => (
                    <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} fillOpacity={0.8} />
                  ))}
                </Bar>
                <Bar dataKey="likes" name="likes" radius={[4, 4, 0, 0]}>
                  {(data?.submissions.chart ?? []).map((_, i) => (
                    <Cell key={i} fill="#EC4899" fillOpacity={0.5} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Level progression */}
        <div className="glass rounded-[20px] p-6">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp size={15} className="text-indigo-400" />
            <span className="text-sm font-semibold text-slate-300">Progression</span>
          </div>
          <div className="text-center mb-5">
            <p className="text-4xl font-heading font-bold text-slate-100">{score}</p>
            <p className="text-xs text-slate-500 mt-1">points au total</p>
          </div>
          {nextLevel ? (
            <div className="space-y-2 mb-5">
              <div className="flex justify-between text-xs text-slate-600">
                <span>{level}</span>
                <span>{nextLevel}</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full bg-gradient-to-r ${gradient} rounded-full transition-all duration-700`} style={{ width: `${levelPct}%` }} />
              </div>
              <p className="text-xs text-center text-slate-600">
                <span className={cn("font-semibold bg-gradient-to-r bg-clip-text text-transparent", gradient)}>
                  +{lMax - score} pts
                </span>{" "}
                pour {nextLevel}
              </p>
            </div>
          ) : (
            <div className="text-center py-3 mb-4">
              <p className="text-2xl">👑</p>
              <p className="text-xs text-amber-400 font-semibold mt-1">Niveau maximum !</p>
            </div>
          )}
          {/* Niches */}
          {(data?.profile.niches ?? []).length > 0 && (
            <div className="pt-4 border-t border-white/[0.06]">
              <p className="text-xs text-slate-500 mb-2">Mes niches</p>
              <div className="flex flex-wrap gap-1.5">
                {(data?.profile.niches ?? []).map((n) => (
                  <span key={n} className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                    {n}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Best submission + Missions breakdown ── */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Best submission */}
        <div className="glass rounded-[20px] p-6">
          <div className="flex items-center gap-2 mb-5">
            <Trophy size={15} className="text-amber-400" />
            <span className="text-sm font-semibold text-slate-300">Meilleure soumission</span>
          </div>
          {data?.submissions.best ? (
            <div className="space-y-4">
              <div className="p-4 rounded-[14px] bg-amber-500/5 border border-amber-500/15">
                <p className="text-sm font-semibold text-slate-200 mb-0.5">{data.submissions.best.challenge}</p>
                <div className="flex items-center gap-2 mt-1">
                  {data.submissions.best.category && (
                    <Badge variant="warning">{data.submissions.best.category}</Badge>
                  )}
                  {data.submissions.best.platform && (
                    <span className="text-xs text-slate-600 capitalize">{data.submissions.best.platform}</span>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Vues",   value: formatNumber(data.submissions.best.views), icon: Eye,   color: "text-blue-400",  bg: "bg-blue-500/10" },
                  { label: "Likes",  value: formatNumber(data.submissions.best.likes), icon: Heart, color: "text-pink-400",  bg: "bg-pink-500/10" },
                  { label: "Score",  value: `${data.submissions.best.score} pts`,      icon: Star,  color: "text-amber-400", bg: "bg-amber-500/10" },
                ].map(({ label, value, icon: Icon, color, bg }) => (
                  <div key={label} className={cn("flex items-center gap-2 p-3 rounded-[12px]", bg)}>
                    <Icon size={14} className={color} />
                    <div>
                      <p className="text-sm font-bold text-slate-100">{value}</p>
                      <p className="text-[11px] text-slate-500">{label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-10 text-center">
              <p className="text-3xl mb-2">🎯</p>
              <p className="text-slate-400 text-sm">Aucune soumission encore</p>
            </div>
          )}
        </div>

        {/* Missions breakdown */}
        <div className="glass rounded-[20px] p-6">
          <div className="flex items-center gap-2 mb-5">
            <Briefcase size={15} className="text-pink-400" />
            <span className="text-sm font-semibold text-slate-300">Missions</span>
            <span className="ml-auto text-xs text-slate-500">{totalMissions} au total</span>
          </div>
          {totalMissions === 0 ? (
            <div className="py-10 text-center">
              <p className="text-3xl mb-2">📭</p>
              <p className="text-slate-400 text-sm">Aucune mission reçue</p>
            </div>
          ) : (
            <div className="space-y-4">
              {MISSION_STATUS.map(({ key, label, color }) => (
                <StatBar
                  key={key}
                  label={label}
                  value={data?.missions.byStatus[key] ?? 0}
                  max={totalMissions}
                  color={color}
                />
              ))}
              <div className="pt-3 border-t border-white/[0.06]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <CheckCircle size={12} className="text-emerald-400" />
                    Missions payées
                  </div>
                  <span className="text-sm font-bold text-emerald-400">
                    {formatMAD(data?.missions.totalEarned ?? 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Clock size={12} className="text-amber-400" />
                    En attente
                  </div>
                  <span className="text-sm font-semibold text-amber-400">
                    {data?.missions.byStatus["PENDING"] ?? 0} mission{(data?.missions.byStatus["PENDING"] ?? 0) > 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
