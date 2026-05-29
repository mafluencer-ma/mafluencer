"use client";

import { useState, useEffect } from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  BarChart3, Briefcase, Users, Wallet, TrendingUp,
  CheckCircle, Clock, Flame, DollarSign,
} from "lucide-react";
import StatCard from "@/components/dashboard/stat-card";
import PageHeader from "@/components/dashboard/page-header";
import { cn, formatMAD } from "@/lib/utils";

type MonthlyEntry = { month: string; total: number };

type StatsData = {
  brand: { balance: number; companyName: string };
  missions: {
    total: number; totalSpent: number; avgBudget: number; uniqueCreators: number;
    byStatus: Record<string, number>;
    byType: Record<string, number>;
    monthlySpend: MonthlyEntry[];
  };
  challenges: { total: number; active: number; completed: number };
};

const STATUS_CONFIG = [
  { key: "PAID",      label: "Payée",      color: "#10B981", bg: "bg-emerald-500/10" },
  { key: "DELIVERED", label: "Livrée",     color: "#3B82F6", bg: "bg-blue-500/10"    },
  { key: "ACCEPTED",  label: "Acceptée",   color: "#6366F1", bg: "bg-indigo-500/10"  },
  { key: "PENDING",   label: "En attente", color: "#F59E0B", bg: "bg-amber-500/10"   },
];

const TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  POST:  { label: "Post photo", color: "#6366F1" },
  STORY: { label: "Story",      color: "#EC4899" },
  VIDEO: { label: "Vidéo",      color: "#8B5CF6" },
  UGC:   { label: "UGC",        color: "#F59E0B" },
};

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-[12px] px-3 py-2 text-xs border border-white/10 shadow-lg">
      <p className="text-slate-400 mb-1">{label}</p>
      <p className="text-indigo-300 font-bold">{formatMAD(payload[0].value)}</p>
    </div>
  );
}

function StatusBar({ label, value, max, color, bg }: { label: string; value: number; max: number; color: string; bg: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <div className={cn("w-7 h-7 rounded-[8px] flex items-center justify-center flex-shrink-0 text-sm", bg)}>
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-slate-400">{label}</span>
          <span className="text-slate-300 font-semibold">{value}</span>
        </div>
        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
        </div>
      </div>
      <span className="text-xs text-slate-600 w-8 text-right">{pct}%</span>
    </div>
  );
}

export default function BrandStatsContent() {
  const [data,    setData]    = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/me/stats")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => setData(d ?? null))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalMissions = Object.values(data?.missions.byStatus ?? {}).reduce((a, v) => a + v, 0);
  const totalTypes    = Object.values(data?.missions.byType   ?? {}).reduce((a, v) => a + v, 0);
  const activeMissions = (data?.missions.byStatus["PENDING"] ?? 0) + (data?.missions.byStatus["ACCEPTED"] ?? 0);

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
        subtitle="Dépenses, missions et performance des campagnes"
        icon={BarChart3}
      />

      {/* ── KPI cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Missions créées"
          value={data?.missions.total ?? 0}
          icon={Briefcase}
          iconColor="text-indigo-400"
          sub={`${activeMissions} en cours`}
        />
        <StatCard
          label="Total dépensé"
          value={formatMAD(data?.missions.totalSpent ?? 0)}
          icon={DollarSign}
          iconColor="text-emerald-400"
          sub="Missions livrées + payées"
        />
        <StatCard
          label="Creators contactés"
          value={data?.missions.uniqueCreators ?? 0}
          icon={Users}
          iconColor="text-pink-400"
          sub="Creators uniques"
        />
        <StatCard
          label="Défis lancés"
          value={data?.challenges.total ?? 0}
          icon={Flame}
          iconColor="text-orange-400"
          sub={`${data?.challenges.active ?? 0} actif · ${data?.challenges.completed ?? 0} terminé`}
        />
      </div>

      {/* ── Spend over time + Status breakdown ── */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Area chart — monthly spend */}
        <div className="lg:col-span-2 glass rounded-[20px] p-6">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp size={15} className="text-indigo-400" />
            <span className="text-sm font-semibold text-slate-300">Dépenses mensuelles</span>
            <span className="ml-auto text-xs text-slate-600">6 derniers mois</span>
          </div>
          {(data?.missions.monthlySpend ?? []).every((m) => m.total === 0) ? (
            <div className="h-48 flex flex-col items-center justify-center text-center">
              <p className="text-3xl mb-2">📊</p>
              <p className="text-slate-400 text-sm font-medium">Aucune dépense encore</p>
              <p className="text-slate-600 text-xs mt-1">Créez une mission pour voir vos stats</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={data?.missions.monthlySpend} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#6366F1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#64748B" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#64748B" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(99,102,241,0.3)", strokeWidth: 1 }} />
                <Area
                  type="monotone" dataKey="total"
                  stroke="#6366F1" strokeWidth={2}
                  fill="url(#spendGradient)"
                  dot={{ fill: "#6366F1", r: 3, strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: "#6366F1" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Budget summary */}
        <div className="glass rounded-[20px] p-6">
          <div className="flex items-center gap-2 mb-5">
            <Wallet size={15} className="text-emerald-400" />
            <span className="text-sm font-semibold text-slate-300">Budget</span>
          </div>
          <div className="space-y-4 mb-5">
            {[
              { label: "Solde disponible",  value: formatMAD(data?.brand.balance ?? 0), color: "text-emerald-400", size: "text-2xl" },
              { label: "Total dépensé",     value: formatMAD(data?.missions.totalSpent ?? 0), color: "text-slate-200", size: "text-xl" },
              { label: "Budget moyen / mission", value: formatMAD(data?.missions.avgBudget ?? 0), color: "text-slate-400", size: "text-base" },
            ].map(({ label, value, color, size }) => (
              <div key={label} className="flex items-center justify-between py-2 border-b border-white/[0.05] last:border-0">
                <span className="text-xs text-slate-500">{label}</span>
                <span className={cn("font-bold tabular-nums", color, size)}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Missions by status + by type ── */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* By status */}
        <div className="glass rounded-[20px] p-6">
          <div className="flex items-center gap-2 mb-5">
            <Briefcase size={15} className="text-pink-400" />
            <span className="text-sm font-semibold text-slate-300">Missions par statut</span>
            <span className="ml-auto text-xs text-slate-500">{totalMissions} total</span>
          </div>
          {totalMissions === 0 ? (
            <div className="py-8 text-center">
              <p className="text-3xl mb-2">📭</p>
              <p className="text-slate-400 text-sm">Aucune mission créée</p>
            </div>
          ) : (
            <div className="space-y-4">
              {STATUS_CONFIG.map(({ key, label, color, bg }) => (
                <StatusBar
                  key={key}
                  label={label}
                  value={data?.missions.byStatus[key] ?? 0}
                  max={totalMissions}
                  color={color}
                  bg={bg}
                />
              ))}
              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-500">
                  <CheckCircle size={12} className="text-emerald-400" />
                  Taux de succès
                </span>
                <span className="font-bold text-emerald-400">
                  {totalMissions > 0
                    ? Math.round(((data?.missions.byStatus["PAID"] ?? 0) / totalMissions) * 100)
                    : 0}%
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-500">
                  <Clock size={12} className="text-amber-400" />
                  En cours
                </span>
                <span className="font-bold text-amber-400">{activeMissions} mission{activeMissions > 1 ? "s" : ""}</span>
              </div>
            </div>
          )}
        </div>

        {/* By type */}
        <div className="glass rounded-[20px] p-6">
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 size={15} className="text-indigo-400" />
            <span className="text-sm font-semibold text-slate-300">Missions par type</span>
          </div>
          {totalTypes === 0 ? (
            <div className="py-8 text-center">
              <p className="text-3xl mb-2">📋</p>
              <p className="text-slate-400 text-sm">Aucune mission encore</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(TYPE_CONFIG).map(([key, { label, color }]) => {
                const count = data?.missions.byType[key] ?? 0;
                const pct   = totalTypes > 0 ? Math.round((count / totalTypes) * 100) : 0;
                return (
                  <div key={key} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">{label}</span>
                      <span className="text-slate-300 font-semibold">{count} <span className="text-slate-600">({pct}%)</span></span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
