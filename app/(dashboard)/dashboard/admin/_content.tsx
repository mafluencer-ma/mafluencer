"use client";

import { useEffect, useState } from "react";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  Users, Briefcase, Building2, Flame,
  TrendingUp, ShieldCheck, AlertCircle, ArrowRight, RefreshCw,
  UserPlus, Clock,
} from "lucide-react";
import Link from "next/link";
import Badge from "@/components/ui/badge";
import PageHeader from "@/components/dashboard/page-header";

type Stats = {
  totalUsers:        number;
  creators:          number;
  brands:            number;
  admins:            number;
  totalChallenges:   number;
  activeChallenges:  number;
  totalMissions:     number;
  totalSubmissions:  number;
  pendingSubmissions:number;
  totalRevenue:      number;
  recentSignups: Array<{
    id:           string;
    name:         string | null;
    email:        string;
    role:         string;
    image:        string | null;
    banned:       boolean;
    createdAt:    string;
  }>;
};

const ROLE_META: Record<string, { label: string; variant: "primary" | "warning" | "success" | "default" }> = {
  CREATOR: { label: "Creator", variant: "primary"  },
  BRAND:   { label: "Brand",   variant: "warning"  },
  MANAGER: { label: "Manager", variant: "default"  },
  ADMIN:   { label: "Admin",   variant: "success"  },
};

const tooltipStyle = {
  backgroundColor: "#1E293B",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "10px",
  color: "#E2E8F0",
  fontSize: "12px",
};

// Placeholder sparkline data (replace with real time-series if/when available)
const WEEKLY = [
  { day: "L", users: 0 }, { day: "M", users: 0 }, { day: "M", users: 0 },
  { day: "J", users: 0 }, { day: "V", users: 0 }, { day: "S", users: 0 }, { day: "D", users: 0 },
];

export default function AdminOverviewContent() {
  const [stats,   setStats]   = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch("/api/admin/stats");
      if (!res.ok) throw new Error("Erreur serveur");
      const data = await res.json() as Stats;
      setStats(data);
    } catch (e) {
      setError("Impossible de charger les statistiques.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="max-w-6xl space-y-6">
      <PageHeader
        title="Vue d'ensemble"
        subtitle="Statistiques globales de la plateforme Mafluencer"
        icon={ShieldCheck}
        action={
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-xs text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all disabled:opacity-50"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            Actualiser
          </button>
        }
      />

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-[14px] bg-red-500/10 border border-red-500/20">
          <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {/* ── Quick actions ── */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            href:  "/dashboard/admin/users",
            icon:  UserPlus,
            label: "Nouveaux inscrits",
            sub:   loading ? "…" : `${stats?.recentSignups?.length ?? 0} récents`,
            color: "text-indigo-400",
            bg:    "bg-indigo-500/15",
            border:"border-indigo-500/20",
          },
          {
            href:  "/dashboard/admin/challenges",
            icon:  Clock,
            label: "Défis en attente",
            sub:   loading ? "…" : `${stats?.activeChallenges ?? 0} actifs`,
            color: "text-orange-400",
            bg:    "bg-orange-500/15",
            border:"border-orange-500/20",
          },
          {
            href:  "/dashboard/admin/missions",
            icon:  Briefcase,
            label: "Toutes les missions",
            sub:   loading ? "…" : `${stats?.totalMissions ?? 0} au total`,
            color: "text-pink-400",
            bg:    "bg-pink-500/15",
            border:"border-pink-500/20",
          },
          {
            href:  "/dashboard/admin/payments",
            icon:  Building2,
            label: "Paiements",
            sub:   loading ? "…" : `${stats?.pendingSubmissions ?? 0} en attente`,
            color: "text-emerald-400",
            bg:    "bg-emerald-500/15",
            border:"border-emerald-500/20",
          },
        ].map(({ href, icon: Icon, label, sub, color, bg, border }) => (
          <Link key={href} href={href}>
            <div className={`glass rounded-[14px] p-4 flex items-center gap-3 border ${border} hover:bg-white/5 transition-all group cursor-pointer hover:scale-[1.02]`}>
              <div className={`w-10 h-10 rounded-[10px] ${bg} flex items-center justify-center flex-shrink-0`}>
                <Icon size={18} className={color} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">{label}</p>
                <p className="text-xs text-slate-500">{sub}</p>
              </div>
              <ArrowRight size={14} className="text-slate-600 group-hover:text-slate-300 transition-colors flex-shrink-0" />
            </div>
          </Link>
        ))}
      </div>

      {/* ── KPI cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: "Utilisateurs inscrits", value: stats?.totalUsers        ?? "—", icon: Users,      color: "text-indigo-400",  bg: "bg-indigo-500/10"  },
          { label: "Créateurs",             value: stats?.creators          ?? "—", icon: TrendingUp,  color: "text-pink-400",    bg: "bg-pink-500/10"    },
          { label: "Marques",               value: stats?.brands            ?? "—", icon: Building2,   color: "text-cyan-400",    bg: "bg-cyan-500/10"    },
          { label: "Défis actifs",          value: stats?.activeChallenges  ?? "—", icon: Flame,       color: "text-orange-400",  bg: "bg-orange-500/10"  },
          { label: "Soumissions vidéo",     value: stats?.totalSubmissions  ?? "—", icon: Briefcase,   color: "text-emerald-400", bg: "bg-emerald-500/10" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className={`glass rounded-[18px] p-5 relative overflow-hidden hover:scale-[1.02] transition-transform ${loading ? "animate-pulse" : ""}`}>
            <div className={`absolute top-3 right-3 w-8 h-8 rounded-[8px] ${bg} flex items-center justify-center`}>
              <Icon size={15} className={color} />
            </div>
            <p className="text-2xl font-heading font-bold text-slate-100 mt-1">{value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Second row KPIs */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: "Tous les défis",         value: stats.totalChallenges,                                color: "text-slate-200"   },
            { label: "Toutes les missions",    value: stats.totalMissions,                                  color: "text-slate-200"   },
            { label: "Vidéos en attente",      value: stats.pendingSubmissions,                             color: "text-amber-400"   },
            { label: "Admins + Managers",      value: stats.admins,                                         color: "text-emerald-400" },
            { label: "Revenus plateforme",     value: `${(stats.totalRevenue / 1000).toFixed(1)}k MAD`,     color: "text-pink-400"    },
          ].map(({ label, value, color }) => (
            <div key={label} className="glass rounded-[14px] p-4 flex items-center justify-between">
              <span className="text-xs text-slate-500">{label}</span>
              <span className={`text-lg font-heading font-bold ${color}`}>{value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Charts + recent signups */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Placeholder area chart */}
        <div className="lg:col-span-2 glass rounded-[20px] p-6">
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm font-semibold text-slate-300">Nouvelles inscriptions</p>
            <Badge variant="primary">{stats?.totalUsers ?? "—"} au total</Badge>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={WEEKLY} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6366F1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="users" stroke="#6366F1" strokeWidth={2} fill="url(#grad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Role breakdown */}
        <div className="glass rounded-[20px] p-6">
          <p className="text-sm font-semibold text-slate-300 mb-5">Répartition des rôles</p>
          {stats ? (
            <>
              <ResponsiveContainer width="100%" height={150}>
                <BarChart
                  data={[
                    { name: "Creators", value: stats.creators },
                    { name: "Brands",   value: stats.brands },
                    { name: "Admins+Mgrs", value: stats.admins },
                  ]}
                  margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={{ fill: "#64748B", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#64748B", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="value" fill="#6366F1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-3">
                {[
                  { name: "Creators", value: stats.creators, color: "#6366F1" },
                  { name: "Brands",   value: stats.brands,   color: "#EC4899" },
                  { name: "Admins+Mgrs", value: stats.admins,   color: "#10B981" },
                ].map(({ name, value, color }) => (
                  <div key={name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                      <span className="text-slate-500">{name}</span>
                    </div>
                    <span className="text-slate-300 font-semibold">{value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-[200px] animate-pulse bg-slate-800/40 rounded-[12px]" />
          )}
        </div>
      </div>

      {/* Recent signups + quick nav */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent signups feed */}
        <div className="lg:col-span-2 glass rounded-[20px] overflow-hidden">
          <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-300">Nouveaux inscrits</p>
            <Link href="/dashboard/admin/users" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1">
              Voir tous <ArrowRight size={11} />
            </Link>
          </div>
          {loading ? (
            <div className="divide-y divide-white/5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-3.5 animate-pulse">
                  <div className="w-8 h-8 rounded-full bg-slate-700/60 flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-slate-700/60 rounded w-32" />
                    <div className="h-2.5 bg-slate-700/40 rounded w-48" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {(stats?.recentSignups ?? []).map((u) => {
                const meta = ROLE_META[u.role] ?? ROLE_META.CREATOR;
                return (
                  <div key={u.id} className="flex items-center gap-4 px-6 py-3 hover:bg-white/[0.02] transition-colors">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500/30 to-pink-500/30 flex items-center justify-center text-xs font-bold text-slate-300 flex-shrink-0">
                      {(u.name ?? u.email).slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-200 truncate">{u.name ?? "—"}</p>
                      <p className="text-xs text-slate-600 truncate">{u.email}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge variant={meta.variant}>{meta.label}</Badge>
                      {u.banned && <Badge variant="error">Banni</Badge>}
                      <span className="text-xs text-slate-600 hidden sm:block">
                        {new Date(u.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                      </span>
                    </div>
                  </div>
                );
              })}
              {!loading && (stats?.recentSignups ?? []).length === 0 && (
                <div className="px-6 py-8 text-center text-slate-600 text-sm">Aucune inscription récente</div>
              )}
            </div>
          )}
        </div>

        {/* Quick nav */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-500 px-1 mb-3">Accès rapide</p>
          {[
            { href: "/dashboard/admin/users",      icon: Users,     label: "Gérer les utilisateurs", sub: `${stats?.totalUsers ?? "…"} inscrits`,          color: "text-indigo-400", bg: "bg-indigo-500/10" },
            { href: "/dashboard/admin/challenges",  icon: Flame,     label: "Gérer les défis",        sub: `${stats?.activeChallenges ?? "…"} actifs`,       color: "text-orange-400", bg: "bg-orange-500/10" },
            { href: "/dashboard/admin/missions",    icon: Briefcase, label: "Gérer les missions",     sub: `${stats?.totalMissions ?? "…"} au total`,        color: "text-pink-400",   bg: "bg-pink-500/10"   },
            { href: "/dashboard/admin/payments",    icon: Building2, label: "Gérer les paiements",    sub: `${stats?.pendingSubmissions ?? "…"} en attente`, color: "text-emerald-400",bg: "bg-emerald-500/10"},
          ].map(({ href, icon: Icon, label, sub, color, bg }) => (
            <Link key={href} href={href}>
              <div className="glass rounded-[14px] p-4 flex items-center gap-3 hover:bg-white/5 transition-colors cursor-pointer group">
                <div className={`w-9 h-9 rounded-[10px] ${bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon size={15} className={color} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200">{label}</p>
                  <p className="text-xs text-slate-600">{sub}</p>
                </div>
                <ArrowRight size={14} className="text-slate-700 group-hover:text-slate-400 transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
