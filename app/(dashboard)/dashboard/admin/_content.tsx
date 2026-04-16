"use client";

import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  Users, Briefcase, Building2, DollarSign, Flame,
  TrendingUp, ShieldCheck, AlertCircle, ArrowRight,
} from "lucide-react";
import Link from "next/link";
import Badge from "@/components/ui/badge";
import PageHeader from "@/components/dashboard/page-header";
import { formatMAD } from "@/lib/utils";

// ── Mock data ────────────────────────────────────────────────────────────────
const MONTHLY_REVENUE = [
  { month: "Nov", revenue: 8200,  users: 142 },
  { month: "Déc", revenue: 11400, users: 198 },
  { month: "Jan", revenue: 9800,  users: 175 },
  { month: "Fév", revenue: 14200, users: 234 },
  { month: "Mar", revenue: 18600, users: 312 },
  { month: "Avr", revenue: 24300, users: 401 },
];

const CHALLENGE_SUBMISSIONS = [
  { week: "S1", submissions: 34, approved: 28 },
  { week: "S2", submissions: 56, approved: 44 },
  { week: "S3", submissions: 48, approved: 39 },
  { week: "S4", submissions: 72, approved: 61 },
  { week: "S5", submissions: 65, approved: 54 },
  { week: "S6", submissions: 89, approved: 74 },
];

const ROLE_DISTRIBUTION = [
  { name: "Creators", value: 847, color: "#6366F1" },
  { name: "Brands",   value: 124, color: "#EC4899" },
  { name: "Admins",   value: 3,   color: "#10B981" },
];

const RECENT_ACTIVITY = [
  { id: 1, type: "user",      label: "Nouveau creator inscrit",       sub: "fatima_zahra · Marrakech",   time: "Il y a 5 min",  variant: "success" as const },
  { id: 2, type: "mission",   label: "Mission livrée",                sub: "@sarabeauty ← Inwi",          time: "Il y a 12 min", variant: "primary" as const },
  { id: 3, type: "withdraw",  label: "Demande de retrait",            sub: "1 200 MAD · @yassine_create", time: "Il y a 28 min", variant: "warning" as const },
  { id: 4, type: "challenge", label: "Défi #HumourRamadan terminé",   sub: "89 soumissions · 3 gagnants", time: "Il y a 1h",     variant: "default" as const },
  { id: 5, type: "brand",     label: "Nouvelle marque inscrite",      sub: "Marjane Market",              time: "Il y a 2h",     variant: "success" as const },
  { id: 6, type: "report",    label: "Signalement contenu",           sub: "Soumission #s142",            time: "Il y a 3h",     variant: "error" as const },
];

const customTooltipStyle = {
  backgroundColor: "#1E293B",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "10px",
  color: "#E2E8F0",
  fontSize: "12px",
};

export default function AdminOverviewContent() {
  return (
    <div className="max-w-6xl space-y-6">
      <PageHeader
        title="Vue d'ensemble"
        subtitle="Statistiques globales de la plateforme Mafluencer"
        icon={ShieldCheck}
      />

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: "Total users",      value: "974",    icon: Users,       color: "text-indigo-400", bg: "bg-indigo-500/10",  trend: "+12%"  },
          { label: "Creators",         value: "847",    icon: TrendingUp,  color: "text-pink-400",   bg: "bg-pink-500/10",    trend: "+8%"   },
          { label: "Brands",           value: "124",    icon: Building2,   color: "text-cyan-400",   bg: "bg-cyan-500/10",    trend: "+23%"  },
          { label: "Revenue (MAD)",    value: "24 300", icon: DollarSign,  color: "text-emerald-400",bg: "bg-emerald-500/10", trend: "+30%"  },
          { label: "Défis actifs",     value: "6",      icon: Flame,       color: "text-orange-400", bg: "bg-orange-500/10",  trend: "actif" },
        ].map(({ label, value, icon: Icon, color, bg, trend }) => (
          <div key={label} className="glass rounded-[18px] p-5 relative overflow-hidden hover:scale-[1.02] transition-transform">
            <div className={`absolute top-3 right-3 w-8 h-8 rounded-[8px] ${bg} flex items-center justify-center`}>
              <Icon size={15} className={color} />
            </div>
            <p className="text-2xl font-heading font-bold text-slate-100 mt-1">{value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
            <p className={`text-[11px] mt-1.5 font-medium ${trend.startsWith("+") ? "text-emerald-400" : "text-slate-500"}`}>{trend}</p>
          </div>
        ))}
      </div>

      {/* Revenue area chart + pie chart */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue over time */}
        <div className="lg:col-span-2 glass rounded-[20px] p-6">
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm font-semibold text-slate-300">Revenus mensuels (MAD)</p>
            <Badge variant="success">+30% ce mois</Badge>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={MONTHLY_REVENUE} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6366F1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={customTooltipStyle} formatter={(v) => [formatMAD(Number(v)), "Revenue"]} />
              <Area type="monotone" dataKey="revenue" stroke="#6366F1" strokeWidth={2} fill="url(#revenueGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Role distribution pie */}
        <div className="glass rounded-[20px] p-6">
          <p className="text-sm font-semibold text-slate-300 mb-5">Répartition des rôles</p>
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie data={ROLE_DISTRIBUTION} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value">
                {ROLE_DISTRIBUTION.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={customTooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {ROLE_DISTRIBUTION.map(({ name, value, color }) => (
              <div key={name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                  <span className="text-slate-500">{name}</span>
                </div>
                <span className="text-slate-300 font-semibold">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Challenges bar chart + new users */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Weekly submissions */}
        <div className="lg:col-span-2 glass rounded-[20px] p-6">
          <p className="text-sm font-semibold text-slate-300 mb-5">Soumissions par semaine</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={CHALLENGE_SUBMISSIONS} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="week" tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={customTooltipStyle} />
              <Legend wrapperStyle={{ fontSize: "11px", color: "#64748B" }} />
              <Bar dataKey="submissions" name="Soumissions" fill="#6366F1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="approved"    name="Approuvées"  fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly users */}
        <div className="glass rounded-[20px] p-6">
          <p className="text-sm font-semibold text-slate-300 mb-5">Nouvelles inscriptions</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={MONTHLY_REVENUE} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
              <XAxis type="number" tick={{ fill: "#64748B", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="month" tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
              <Tooltip contentStyle={customTooltipStyle} />
              <Bar dataKey="users" name="Inscrits" fill="#EC4899" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent activity + quick nav */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Activity feed */}
        <div className="lg:col-span-2 glass rounded-[20px] overflow-hidden">
          <div className="px-6 py-4 border-b border-white/8">
            <p className="text-sm font-semibold text-slate-300">Activité récente</p>
          </div>
          <div className="divide-y divide-white/5">
            {RECENT_ACTIVITY.map((a) => (
              <div key={a.id} className="flex items-center gap-4 px-6 py-3 hover:bg-white/2 transition-colors">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  a.variant === "success" ? "bg-emerald-400" :
                  a.variant === "warning" ? "bg-amber-400" :
                  a.variant === "error"   ? "bg-red-400" :
                  a.variant === "primary" ? "bg-indigo-400" : "bg-slate-500"
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200">{a.label}</p>
                  <p className="text-xs text-slate-600 truncate">{a.sub}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge variant={a.variant === "default" ? "default" : a.variant}>{a.time}</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick admin nav */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-500 px-1 mb-3">Navigation rapide</p>
          {[
            { href: "/dashboard/admin/users",      icon: Users,      label: "Gérer les users",   sub: "974 inscrits",        color: "text-indigo-400", bg: "bg-indigo-500/10" },
            { href: "/dashboard/admin/challenges",  icon: Flame,      label: "Défis",             sub: "6 actifs en cours",   color: "text-orange-400", bg: "bg-orange-500/10" },
            { href: "/dashboard/admin/missions",    icon: Briefcase,  label: "Missions",          sub: "Voir les commissions",color: "text-pink-400",   bg: "bg-pink-500/10"   },
            { href: "/dashboard/admin/payments",    icon: DollarSign, label: "Paiements",         sub: "3 retraits en attente",color: "text-emerald-400",bg: "bg-emerald-500/10"},
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
