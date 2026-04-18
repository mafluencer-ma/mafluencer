"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  LayoutDashboard, TrendingUp, Users, DollarSign,
  Briefcase, Flame, ArrowRight, RefreshCw, PlusCircle,
} from "lucide-react";
import type { Session } from "next-auth";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import PageHeader from "@/components/dashboard/page-header";
import { formatMAD, formatNumber } from "@/lib/utils";

type Mission = {
  id: string; creator: string; type: string; budget: number;
  status: string; deadline: string;
};

type Creator = {
  id: string; name: string; score: number; niches: string[];
  followersCount: number; engagementRate: number; pricePerPost: number | null;
};

type OverviewData = {
  balance: number;
  activeMissions: number;
  totalCreators: number;
  missions: Mission[];
  topCreators: Creator[];
};

const MISSION_STATUS: Record<string, { label: string; variant: "warning" | "primary" | "success" | "default" }> = {
  PENDING:   { label: "En attente", variant: "warning" },
  ACCEPTED:  { label: "Acceptée",   variant: "primary" },
  DELIVERED: { label: "Livrée",     variant: "success" },
};

export default function BrandOverviewContent({ session }: { session: Session }) {
  const [data, setData]       = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const name = session.user?.name?.split(" ")[0] ?? "Brand";

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [meRes, missionsRes, creatorsRes] = await Promise.all([
          fetch("/api/me"),
          fetch("/api/missions?limit=5"),
          fetch("/api/creators?limit=5"),
        ]);

        const meData       = meRes.ok       ? await meRes.json()       : null;
        const missionsData = missionsRes.ok ? await missionsRes.json() : null;
        const creatorsData = creatorsRes.ok ? await creatorsRes.json() : null;

        const rawMissions: Array<{
          id: string; type: string; budget: number; status: string;
          deliveryDate: string | null; createdAt: string;
          creator: { id: string; name: string | null } | null;
        }> = missionsData?.missions ?? [];

        const rawCreators: Array<{
          id: string; name: string | null; score: number; niches: string[];
          followersCount: number; engagementRate: number; pricePerPost: number | null;
        }> = creatorsData?.creators ?? [];

        setData({
          balance:        meData?.brandProfile?.balance ?? 0,
          activeMissions: rawMissions.filter((m) => ["PENDING", "ACCEPTED", "DELIVERED"].includes(m.status)).length,
          totalCreators:  creatorsData?.pagination?.total ?? 0,
          missions:       rawMissions.map((m) => ({
            id:       m.id,
            creator:  m.creator?.name ?? "Creator",
            type:     m.type,
            budget:   m.budget,
            status:   m.status,
            deadline: m.deliveryDate
              ? new Date(m.deliveryDate).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
              : "—",
          })),
          topCreators: rawCreators.map((c) => ({
            id:             c.id,
            name:           c.name ?? "Creator",
            score:          c.score,
            niches:         c.niches,
            followersCount: c.followersCount,
            engagementRate: c.engagementRate,
            pricePerPost:   c.pricePerPost,
          })),
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

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
          { label: "Missions actives",  value: loading ? "—" : String(data?.activeMissions ?? 0), icon: Briefcase,  color: "text-indigo-400",  sub: "En cours" },
          { label: "Solde disponible",  value: loading ? "—" : formatMAD(data?.balance ?? 0),      icon: DollarSign, color: "text-emerald-400", sub: "MAD" },
          { label: "Creators inscrits", value: loading ? "—" : String(data?.totalCreators ?? 0),   icon: Users,      color: "text-pink-400",    sub: "Sur la plateforme" },
          { label: "Découvrir",         value: "→",                                                  icon: TrendingUp, color: "text-amber-400",   sub: "Explorer les creators" },
        ].map(({ label, value, icon: Icon, color, sub }) => (
          <div key={label} className={`glass rounded-[18px] p-5 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-200 ${loading && label !== "Découvrir" ? "animate-pulse" : ""}`}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent" />
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
        {/* Balance card */}
        <div className="lg:col-span-2 glass rounded-[20px] p-6">
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm font-semibold text-slate-300">Solde disponible</p>
          </div>
          <div className="text-center py-4">
            {loading ? (
              <div className="h-12 bg-slate-700/60 rounded w-32 mx-auto animate-pulse" />
            ) : (
              <p className="text-4xl font-heading font-bold text-slate-100">
                {(data?.balance ?? 0).toLocaleString("fr-MA")}
                <span className="text-lg text-slate-500 ml-1">MAD</span>
              </p>
            )}
          </div>
          <Link href="/dashboard/brand/billing">
            <Button variant="primary" className="w-full mt-4">
              <DollarSign size={14} /> Recharger le solde
            </Button>
          </Link>
        </div>

        {/* Active missions */}
        <div className="lg:col-span-3 glass rounded-[20px] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08]">
            <p className="text-sm font-semibold text-slate-300">Missions en cours</p>
            <Link href="/dashboard/brand/missions" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors">
              Tout voir <ArrowRight size={12} />
            </Link>
          </div>
          {loading ? (
            <div className="divide-y divide-white/5">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-3 animate-pulse">
                  <div className="w-9 h-9 rounded-full bg-slate-700/60 flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-slate-700/60 rounded w-28" />
                    <div className="h-2.5 bg-slate-700/40 rounded w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : (data?.missions ?? []).length === 0 ? (
            <div className="px-6 py-8 text-center text-slate-600 text-sm">
              Aucune mission en cours —{" "}
              <Link href="/dashboard/brand/missions/new" className="text-indigo-400 hover:text-indigo-300">
                en créer une
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {(data?.missions ?? []).map((m) => {
                const meta = MISSION_STATUS[m.status] ?? MISSION_STATUS.PENDING;
                return (
                  <div key={m.id} className="flex items-center gap-4 px-6 py-3 hover:bg-white/[0.02] transition-colors">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                      {m.creator.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-200">{m.creator}</p>
                      <p className="text-xs text-slate-600">{m.type} · {m.deadline}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-sm font-bold text-emerald-400 tabular-nums hidden sm:block">{formatMAD(m.budget)}</span>
                      <Badge variant={meta.variant}>{meta.label}</Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Top creators + Quick actions */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Top creators */}
        <div className="lg:col-span-3 glass rounded-[20px] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08]">
            <p className="text-sm font-semibold text-slate-300">Top creators recommandés</p>
            <Link href="/dashboard/brand/discover" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors">
              Explorer <ArrowRight size={12} />
            </Link>
          </div>
          {loading ? (
            <div className="divide-y divide-white/5">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-3 animate-pulse">
                  <div className="w-9 h-9 rounded-full bg-slate-700/60 flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-slate-700/60 rounded w-24" />
                    <div className="h-2.5 bg-slate-700/40 rounded w-36" />
                  </div>
                </div>
              ))}
            </div>
          ) : (data?.topCreators ?? []).length === 0 ? (
            <div className="px-6 py-8 text-center text-slate-600 text-sm">Aucun creator inscrit pour l&apos;instant</div>
          ) : (
            <div className="divide-y divide-white/5">
              {(data?.topCreators ?? []).map((c, i) => (
                <div key={c.id} className="flex items-center gap-4 px-6 py-3 hover:bg-white/[0.02] transition-colors">
                  <span className="text-xs font-bold text-slate-600 w-4 flex-shrink-0">#{i + 1}</span>
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500/40 to-pink-500/40 flex items-center justify-center text-xs font-bold text-slate-200 flex-shrink-0">
                    {c.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200">{c.name}</p>
                    <p className="text-xs text-slate-600">{c.niches[0] ?? "Creator"} · {formatNumber(c.followersCount)} abonnés</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 text-right">
                    <div>
                      <p className="text-xs font-bold text-indigo-300">{c.score} pts</p>
                      <p className="text-xs text-slate-600">{c.engagementRate}% eng.</p>
                    </div>
                    <Link href={`/dashboard/brand/missions/new?creator=${c.id}`}>
                      <Button variant="ghost" size="sm"><Briefcase size={12} /></Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="lg:col-span-2 space-y-3">
          <p className="text-sm font-semibold text-slate-400 px-1">Actions rapides</p>
          {[
            { href: "/dashboard/brand/missions/new",   icon: Briefcase, label: "Créer une mission",        sub: "Contacter un creator directement",    color: "text-indigo-400", bg: "bg-indigo-500/10" },
            { href: "/dashboard/brand/challenges/new", icon: Flame,     label: "Lancer un défi sponsorisé", sub: "Challenge de marque avec prize pool", color: "text-orange-400", bg: "bg-orange-500/10" },
            { href: "/dashboard/brand/discover",       icon: Users,     label: "Découvrir des creators",    sub: "Filtre par niche, ville, score",      color: "text-pink-400",   bg: "bg-pink-500/10" },
            { href: "/dashboard/brand/billing",        icon: DollarSign,label: "Recharger le solde",        sub: `Solde : ${loading ? "…" : formatMAD(data?.balance ?? 0)}`, color: "text-emerald-400", bg: "bg-emerald-500/10" },
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
