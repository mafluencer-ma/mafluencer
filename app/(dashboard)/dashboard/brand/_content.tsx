"use client";

import Link from "next/link";
import {
  LayoutDashboard, TrendingUp, Users, DollarSign,
  Briefcase, Flame, ArrowRight, CheckCircle, Clock, Package,
  BarChart3, PlusCircle, Star,
} from "lucide-react";
import type { Session } from "next-auth";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import PageHeader from "@/components/dashboard/page-header";
import { formatMAD } from "@/lib/utils";

const ACTIVE_MISSIONS = [
  { id: "m1", creator: "Yassine_Create", niche: "Humour", budget: 1500, status: "ACCEPTED",  deadline: "25 Avr 2025", avatar: "YC" },
  { id: "m2", creator: "SaraBeauty",     niche: "Beauté", budget: 800,  status: "DELIVERED", deadline: "20 Avr 2025", avatar: "SB" },
  { id: "m3", creator: "TechMaroc",      niche: "Tech",   budget: 2000, status: "PENDING",   deadline: "30 Avr 2025", avatar: "TM" },
];

const TOP_CREATORS = [
  { username: "yassine_create", name: "Yassine C.", score: 847, niche: "Humour", followers: "124K", rate: "8.2%" },
  { username: "sarabeauty",     name: "Sara B.",    score: 762, niche: "Beauté", followers: "89K",  rate: "9.1%" },
  { username: "techmaroc",      name: "TechMaroc",  score: 698, niche: "Tech",   followers: "67K",  rate: "6.8%" },
];

const MISSION_STATUS: Record<string, { label: string; variant: "warning" | "primary" | "success" | "default" }> = {
  PENDING:   { label: "En attente", variant: "warning" },
  ACCEPTED:  { label: "Acceptée",   variant: "primary" },
  DELIVERED: { label: "Livrée",     variant: "success" },
};

const MONTHS_SPEND = [8500, 12000, 15400];
const MONTHS_LABEL = ["Fév", "Mar", "Avr"];
const MAX_SPEND = 15400;

export default function BrandOverviewContent({ session }: { session: Session }) {
  const name = session.user?.name?.split(" ")[0] ?? "Brand";

  return (
    <div className="max-w-5xl space-y-6">
      <PageHeader
        title={`Bonjour, ${name} 👋`}
        subtitle="Vue d'ensemble de tes campagnes et performances"
        icon={LayoutDashboard}
        action={
          <Link href="/dashboard/brand/missions/new">
            <Button variant="primary">
              <PlusCircle size={15} /> Nouvelle mission
            </Button>
          </Link>
        }
      />

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Campagnes actives",     value: "3",           icon: Briefcase,   color: "text-indigo-400", sub: "+1 ce mois" },
          { label: "Total dépensé",         value: "15 400 MAD",  icon: DollarSign,  color: "text-emerald-400", sub: "Ce mois" },
          { label: "Creators contactés",    value: "12",          icon: Users,       color: "text-pink-400",   sub: "Toutes missions" },
          { label: "ROI estimé",            value: "×3.2",        icon: TrendingUp,  color: "text-amber-400",  sub: "Valeur médias générée" },
        ].map(({ label, value, icon: Icon, color, sub }) => (
          <div key={label} className="glass rounded-[18px] p-5 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-200">
            <div className="absolute inset-0 bg-gradient-to-br from-white/2 to-transparent" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <Icon size={16} className={color} />
              </div>
              <p className="text-xl font-heading font-bold text-slate-100 leading-tight">{value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{label}</p>
              <p className="text-xs text-slate-700 mt-1">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Spend chart */}
        <div className="lg:col-span-2 glass rounded-[20px] p-6">
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm font-semibold text-slate-300">Dépenses mensuelles</p>
            <Badge variant="success">+28% ce mois</Badge>
          </div>
          <div className="flex items-end gap-3 h-28">
            {MONTHS_SPEND.map((v, i) => {
              const pct = (v / MAX_SPEND) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                  <span className="text-[10px] text-slate-600">{(v / 1000).toFixed(1)}k</span>
                  <div
                    className="w-full bg-gradient-to-t from-indigo-500 to-pink-500 rounded-t-[6px] transition-all duration-500"
                    style={{ height: `${pct}%` }}
                  />
                  <span className="text-[10px] text-slate-600">{MONTHS_LABEL[i]}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-5 pt-4 border-t border-white/8 flex justify-between text-xs text-slate-600">
            <span>Budget restant</span>
            <span className="text-emerald-400 font-semibold">34 600 MAD</span>
          </div>
        </div>

        {/* Active missions */}
        <div className="lg:col-span-3 glass rounded-[20px] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
            <p className="text-sm font-semibold text-slate-300">Missions en cours</p>
            <Link href="/dashboard/brand/missions" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors">
              Tout voir <ArrowRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-white/5">
            {ACTIVE_MISSIONS.map((m) => {
              const meta = MISSION_STATUS[m.status];
              return (
                <div key={m.id} className="flex items-center gap-4 px-6 py-3 hover:bg-white/2 transition-colors">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                    {m.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200">{m.creator}</p>
                    <p className="text-xs text-slate-600">{m.niche} · {m.deadline}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-sm font-bold text-emerald-400 tabular-nums hidden sm:block">{formatMAD(m.budget)}</span>
                    <Badge variant={meta.variant}>{meta.label}</Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top creators + Quick actions */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Top creators */}
        <div className="lg:col-span-3 glass rounded-[20px] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
            <p className="text-sm font-semibold text-slate-300">Top creators recommandés</p>
            <Link href="/dashboard/brand/discover" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors">
              Explorer <ArrowRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-white/5">
            {TOP_CREATORS.map((c, i) => (
              <div key={c.username} className="flex items-center gap-4 px-6 py-3 hover:bg-white/2 transition-colors">
                <span className="text-xs font-bold text-slate-600 w-4 flex-shrink-0">#{i + 1}</span>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500/40 to-pink-500/40 flex items-center justify-center text-xs font-bold text-slate-200 flex-shrink-0">
                  {c.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200">{c.name}</p>
                  <p className="text-xs text-slate-600">{c.niche} · {c.followers} abonnés</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 text-right">
                  <div>
                    <p className="text-xs font-bold text-indigo-300">{c.score} pts</p>
                    <p className="text-xs text-slate-600">{c.rate} eng.</p>
                  </div>
                  <Link href={`/dashboard/brand/missions/new?creator=${c.username}`}>
                    <Button variant="ghost" size="sm">
                      <Briefcase size={12} />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="lg:col-span-2 space-y-3">
          <p className="text-sm font-semibold text-slate-400 px-1">Actions rapides</p>
          {[
            { href: "/dashboard/brand/missions/new",  icon: Briefcase, label: "Créer une mission",        sub: "Contacter un creator directement",      color: "text-indigo-400", bg: "bg-indigo-500/10" },
            { href: "/dashboard/brand/challenges/new", icon: Flame,    label: "Lancer un défi sponsorisé", sub: "Challenge de marque avec prize pool",   color: "text-orange-400", bg: "bg-orange-500/10" },
            { href: "/dashboard/brand/discover",       icon: Users,    label: "Découvrir des creators",    sub: "Filtre par niche, ville, score",         color: "text-pink-400",   bg: "bg-pink-500/10" },
            { href: "/dashboard/brand/billing",        icon: DollarSign, label: "Recharger le solde",      sub: "Solde actuel : 34 600 MAD",             color: "text-emerald-400", bg: "bg-emerald-500/10" },
          ].map(({ href, icon: Icon, label, sub, color, bg }) => (
            <Link key={href} href={href}>
              <div className="glass rounded-[14px] p-4 flex items-center gap-3 hover:bg-white/5 transition-colors cursor-pointer group">
                <div className={`w-9 h-9 rounded-[10px] ${bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon size={16} className={color} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">{label}</p>
                  <p className="text-xs text-slate-600 truncate">{sub}</p>
                </div>
                <ArrowRight size={14} className="text-slate-700 group-hover:text-slate-400 transition-colors flex-shrink-0" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
