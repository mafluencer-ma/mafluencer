"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users, DollarSign, Briefcase, Flame, ArrowRight,
  CheckCircle, Circle, Sparkles, ChevronRight, Building2,
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
  balance:        number;
  activeMissions: number;
  totalCreators:  number;
  missions:       Mission[];
  topCreators:    Creator[];
  companyName:    string;
  hasChallenge:   boolean;
};

const MISSION_STATUS: Record<string, { label: string; variant: "warning" | "primary" | "success" | "default" }> = {
  PENDING:   { label: "En attente", variant: "warning" },
  ACCEPTED:  { label: "Acceptée",   variant: "primary" },
  DELIVERED: { label: "Livrée",     variant: "success" },
};

const MISSION_TYPE_FR: Record<string, string> = {
  POST: "Post photo", STORY: "Story", VIDEO: "Vidéo", UGC: "UGC",
};

export default function BrandOverviewContent({ session }: { session: Session }) {
  const [data, setData]       = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const name = session.user?.name?.split(" ")[0] ?? "vous";

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
          balance:        meData?.brandProfile?.balance      ?? 0,
          companyName:    meData?.brandProfile?.companyName  ?? name,
          activeMissions: rawMissions.filter((m) => ["PENDING", "ACCEPTED", "DELIVERED"].includes(m.status)).length,
          totalCreators:  creatorsData?.pagination?.total    ?? 0,
          hasChallenge:   rawMissions.length > 0,
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

  const isNewBrand = !loading && data && !data.hasChallenge;

  // Onboarding steps for new brands
  const onboardingSteps = data ? [
    {
      label:    "Créer une mission",
      sublabel: "Contacter un créateur directement",
      done:     data.hasChallenge,
      href:     "/dashboard/brand/missions/new",
      icon:     Briefcase,
    },
    {
      label:    "Lancer un défi",
      sublabel: "Défi de marque avec prize pool",
      done:     false,
      href:     "/dashboard/brand/challenges/new",
      icon:     Flame,
    },
    {
      label:    "Découvrir des créateurs",
      sublabel: "Filtre par niche, ville et score",
      done:     false,
      href:     "/dashboard/brand/discover",
      icon:     Users,
    },
  ] : [];

  return (
    <div className="max-w-5xl space-y-6">
      <PageHeader
        title={`Bonjour, ${name} 👋`}
        subtitle={data?.companyName ? `Tableau de bord — ${data.companyName}` : "Tableau de bord de ta marque"}
        icon={Building2}
        action={
          <Link href="/dashboard/brand/missions/new">
            <Button variant="primary">
              <Briefcase size={15} /> Nouvelle mission
            </Button>
          </Link>
        }
      />

      {/* ── Big CTA (always visible) ── */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Link href="/dashboard/brand/missions/new" className="block">
          <div className="relative overflow-hidden rounded-[18px] p-6 bg-gradient-to-br from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 transition-all hover:scale-[1.02] shadow-lg shadow-indigo-500/20 cursor-pointer group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
            <div className="relative z-10">
              <Briefcase size={24} className="text-white/80 mb-3" />
              <p className="text-lg font-heading font-bold text-white">Créer une mission</p>
              <p className="text-white/70 text-sm mt-1">Collaborer avec un créateur</p>
              <div className="mt-4 flex items-center gap-1 text-white/80 text-sm font-medium">
                Commencer <ArrowRight size={14} />
              </div>
            </div>
          </div>
        </Link>

        <Link href="/dashboard/brand/challenges/new" className="block">
          <div className="relative overflow-hidden rounded-[18px] p-6 bg-gradient-to-br from-orange-600 to-pink-600 hover:from-orange-500 hover:to-pink-500 transition-all hover:scale-[1.02] shadow-lg shadow-orange-500/20 cursor-pointer group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
            <div className="relative z-10">
              <Flame size={24} className="text-white/80 mb-3" />
              <p className="text-lg font-heading font-bold text-white">Lancer un défi</p>
              <p className="text-white/70 text-sm mt-1">Challenge avec prize pool</p>
              <div className="mt-4 flex items-center gap-1 text-white/80 text-sm font-medium">
                Créer <ArrowRight size={14} />
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* ── Onboarding checklist (new brands only) ── */}
      {isNewBrand && (
        <div className="glass rounded-[20px] p-6 border border-amber-500/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={16} className="text-amber-400" />
              <span className="text-sm font-semibold text-amber-300">Par où commencer ?</span>
            </div>
            <p className="text-xs text-slate-500 mb-5">Suis ces 3 étapes pour lancer ta première campagne</p>
            <div className="space-y-3">
              {onboardingSteps.map((step, i) => {
                const Icon = step.icon;
                return (
                  <Link key={i} href={step.href}>
                    <div className="flex items-center gap-3 p-3.5 rounded-[12px] border border-white/[0.08] bg-white/[0.02] hover:border-amber-500/30 hover:bg-amber-500/5 transition-all group cursor-pointer">
                      <div className={`w-8 h-8 rounded-[8px] flex items-center justify-center flex-shrink-0 ${step.done ? "bg-emerald-500/15" : "bg-amber-500/10"}`}>
                        {step.done
                          ? <CheckCircle size={15} className="text-emerald-400" />
                          : <Icon size={15} className="text-amber-400" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-200">
                          <span className="text-slate-500 mr-1">Étape {i + 1} —</span>
                          {step.label}
                        </p>
                        <p className="text-xs text-slate-600">{step.sublabel}</p>
                      </div>
                      <ArrowRight size={13} className="text-slate-600 group-hover:text-amber-400 transition-colors flex-shrink-0" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── KPI cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          {
            label: "Missions actives",
            value: loading ? "—" : String(data?.activeMissions ?? 0),
            sub:   loading ? "" : (data?.activeMissions ?? 0) === 0 ? "Aucune mission en cours" : "Collaborations en cours",
            icon:  Briefcase,
            color: "text-indigo-400",
            bg:    "bg-indigo-500/10",
          },
          {
            label: "Solde disponible",
            value: loading ? "—" : `${(data?.balance ?? 0).toLocaleString("fr-MA")} MAD`,
            sub:   "Pour payer les créateurs",
            icon:  DollarSign,
            color: "text-emerald-400",
            bg:    "bg-emerald-500/10",
          },
          {
            label: "Créateurs inscrits",
            value: loading ? "—" : String(data?.totalCreators ?? 0),
            sub:   "Disponibles pour tes campagnes",
            icon:  Users,
            color: "text-pink-400",
            bg:    "bg-pink-500/10",
          },
        ].map(({ label, value, sub, icon: Icon, color, bg }) => (
          <div key={label} className={`glass rounded-[18px] p-5 relative overflow-hidden hover:scale-[1.02] transition-transform duration-200 ${loading ? "animate-pulse" : ""}`}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent" />
            <div className="relative z-10">
              <div className={`w-9 h-9 rounded-[10px] ${bg} flex items-center justify-center mb-3`}>
                <Icon size={16} className={color} />
              </div>
              <p className="text-2xl font-heading font-bold text-slate-100 leading-tight">{value}</p>
              <p className="text-xs font-medium text-slate-400 mt-0.5">{label}</p>
              <p className="text-xs text-slate-600 mt-0.5">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Balance + missions ── */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Balance */}
        <div className="lg:col-span-2 glass rounded-[20px] p-6">
          <p className="text-sm font-semibold text-slate-300 mb-4">Solde du compte</p>
          <div className="text-center py-3">
            {loading ? (
              <div className="h-12 bg-slate-700/60 rounded w-32 mx-auto animate-pulse" />
            ) : (
              <>
                <p className="text-4xl font-heading font-bold text-slate-100">
                  {(data?.balance ?? 0).toLocaleString("fr-MA")}
                  <span className="text-lg text-slate-500 ml-1">MAD</span>
                </p>
                {(data?.balance ?? 0) === 0 && (
                  <p className="text-xs text-amber-400 mt-2">Recharge pour lancer des missions</p>
                )}
              </>
            )}
          </div>
          <Link href="/dashboard/brand/billing" className="block mt-5">
            <button className="w-full py-3 rounded-[12px] bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20">
              <DollarSign size={15} />
              Recharger le solde
            </button>
          </Link>
          <p className="text-[11px] text-slate-600 text-center mt-3">
            Paiement sécurisé · Carte bancaire ou virement
          </p>
        </div>

        {/* Missions */}
        <div className="lg:col-span-3 glass rounded-[20px] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08]">
            <p className="text-sm font-semibold text-slate-300">Missions en cours</p>
            <Link href="/dashboard/brand/missions" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors">
              Tout voir <ChevronRight size={12} />
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
            <div className="px-6 py-10 text-center">
              <p className="text-2xl mb-3">📋</p>
              <p className="text-slate-400 text-sm font-medium">Aucune mission lancée</p>
              <p className="text-slate-600 text-xs mt-1 mb-4">Contacte un créateur pour ta première collaboration</p>
              <Link href="/dashboard/brand/missions/new">
                <button className="px-5 py-2.5 rounded-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-sm font-medium hover:bg-indigo-500/30 transition-all">
                  Créer une mission
                </button>
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
                      <p className="text-xs text-slate-600">{MISSION_TYPE_FR[m.type] ?? m.type} · Délai : {m.deadline}</p>
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

      {/* ── Top creators ── */}
      <div className="glass rounded-[20px] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08]">
          <div>
            <p className="text-sm font-semibold text-slate-300">Créateurs recommandés pour toi</p>
            <p className="text-xs text-slate-600 mt-0.5">Classés par score et engagement</p>
          </div>
          <Link href="/dashboard/brand/discover" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors">
            Voir tous <ChevronRight size={12} />
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
          <div className="px-6 py-10 text-center">
            <p className="text-2xl mb-2">👥</p>
            <p className="text-slate-500 text-sm">Aucun créateur disponible pour l&apos;instant</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {(data?.topCreators ?? []).map((c, i) => (
              <div key={c.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-white/[0.02] transition-colors">
                <span className="text-xs font-bold text-slate-600 w-4 flex-shrink-0">#{i + 1}</span>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500/40 to-pink-500/40 flex items-center justify-center text-xs font-bold text-slate-200 flex-shrink-0">
                  {c.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200">{c.name}</p>
                  <p className="text-xs text-slate-600">
                    {c.niches[0] ?? "Créateur"} · {formatNumber(c.followersCount)} abonnés · {c.engagementRate}% engagement
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-bold text-indigo-300">{c.score} pts</p>
                    {c.pricePerPost && <p className="text-xs text-slate-600">{formatMAD(c.pricePerPost)}/post</p>}
                  </div>
                  <Link href={`/dashboard/brand/missions/new?creator=${c.id}`}>
                    <button className="px-3 py-1.5 rounded-[8px] bg-indigo-500/15 text-indigo-300 border border-indigo-500/20 text-xs font-medium hover:bg-indigo-500/25 transition-all">
                      Contacter
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
