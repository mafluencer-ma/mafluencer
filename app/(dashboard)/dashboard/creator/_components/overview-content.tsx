"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Trophy, Flame, Wallet, Briefcase, ArrowRight,
  TrendingUp, Clock, ChevronRight, CheckCircle, Circle,
  BadgeCheck, User, Camera, Sparkles,
} from "lucide-react";
import type { Session } from "next-auth";
import StatCard from "@/components/dashboard/stat-card";
import ScoreRing from "@/components/ui/score-ring";
import Badge from "@/components/ui/badge";
import CountdownTimer from "@/components/dashboard/countdown-timer";
import CreatorOnboardingModal from "@/components/creator-onboarding-modal";
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
  score:               number;
  level:               string;
  challengesCompleted: number;
  earningsThisMonth:   number;
  pendingMissions:     number;
  activeChallenge:     ActiveChallenge | null;
  recentMissions:      RecentMission[];
  // profile fields for onboarding
  hasBio:               boolean;
  hasNiches:            boolean;
  hasCity:              boolean;
  hasSocial:            boolean;
  hasPrice:             boolean;
  isVerified:           boolean;
  onboardingCompleted:  boolean;
};

const MISSION_STATUS_LABELS: Record<string, { label: string; variant: "success" | "warning" | "primary" | "default" }> = {
  PENDING:   { label: "En attente", variant: "warning" },
  ACCEPTED:  { label: "Acceptée",   variant: "primary" },
  DELIVERED: { label: "Livrée",     variant: "success" },
  PAID:      { label: "Payée",      variant: "success" },
};

const MISSION_TYPE_LABELS: Record<string, string> = {
  POST:  "Post photo",
  STORY: "Story",
  VIDEO: "Vidéo",
  UGC:   "UGC",
};

export default function CreatorOverviewContent({ session }: { session: Session }) {
  const [data, setData]               = useState<OverviewData | null>(null);
  const [loading, setLoading]         = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
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

        const meData         = meRes.ok        ? await meRes.json()        : null;
        const challengesData = challengesRes.ok ? await challengesRes.json() : null;
        const missionsData   = missionsRes.ok   ? await missionsRes.json()   : null;

        const profile  = meData?.creatorProfile;
        const missions = (missionsData?.missions ?? []) as Array<{
          id: string; title: string; budget: number; status: string; type: string;
          brand: { name: string; logo: string | null } | null;
        }>;
        const challenges = challengesData?.challenges ?? [];

        const pendingMissions = missions.filter((m) => m.status === "PENDING").length;
        const activeChallenge = challenges[0]
          ? {
              id:              challenges[0].id,
              title:           challenges[0].title,
              category:        challenges[0].category,
              endDate:         new Date(challenges[0].endDate),
              submissionCount: challenges[0].submissionCount ?? 0,
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
          hasBio:              !!(profile?.bio?.trim()),
          hasNiches:           (profile?.niches?.length ?? 0) > 0,
          hasCity:             !!(profile?.city?.trim()),
          hasSocial:           !!(profile?.tiktokHandle || profile?.instagramHandle),
          hasPrice:            !!(profile?.pricePerPost),
          isVerified:          profile?.verified ?? false,
          onboardingCompleted: profile?.onboardingCompleted ?? false,
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Show onboarding modal for new creators who haven't completed it
  useEffect(() => {
    if (!loading && data && !data.onboardingCompleted) {
      setShowOnboarding(true);
    }
  }, [loading, data]);

  const score    = data?.score ?? 0;
  const level    = data?.level ?? getScoreLevel(score);
  const gradient = getLevelGradient(level);

  // Profile completion score
  const completionSteps = data
    ? [data.hasBio && data.hasNiches && data.hasCity, data.hasSocial, data.isVerified, data.challengesCompleted > 0]
    : [false, false, false, false];
  const completionPct = Math.round((completionSteps.filter(Boolean).length / completionSteps.length) * 100);
  const isNewCreator  = !loading && (data?.challengesCompleted ?? 0) === 0;

  // Onboarding steps
  const onboardingSteps = data ? [
    {
      label:    "Complète ton profil",
      sublabel: "Bio, ville, niches, tarifs",
      done:     data.hasBio && data.hasNiches && data.hasCity,
      href:     "/dashboard/creator/profile",
      icon:     User,
    },
    {
      label:    "Vérifie ton TikTok ou Instagram",
      sublabel: "Prouve ton audience aux marques",
      done:     data.isVerified,
      href:     "/dashboard/creator/profile",
      icon:     BadgeCheck,
    },
    {
      label:    "Rejoins ton premier défi",
      sublabel: "Participe pour gagner des points",
      done:     data.challengesCompleted > 0,
      href:     "/dashboard/creator/challenges",
      icon:     Flame,
    },
    {
      label:    "Soumets ta vidéo",
      sublabel: "Film, monte, et envoie !",
      done:     false, // we don't track this separately yet
      href:     "/dashboard/creator/challenges",
      icon:     Camera,
    },
  ] : [];

  const nextStep = onboardingSteps.find((s) => !s.done);

  if (loading) {
    return (
      <div className="space-y-6 max-w-6xl">
        <div className="h-8 w-64 bg-slate-700/60 rounded-lg animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass rounded-[16px] p-5 animate-pulse">
              <div className="h-8 bg-slate-700/60 rounded w-20 mb-2" />
              <div className="h-3 bg-slate-700/40 rounded w-32" />
            </div>
          ))}
        </div>
        <div className="glass rounded-[20px] p-6 animate-pulse h-40" />
      </div>
    );
  }

  return (
    <>
    {showOnboarding && (
      <CreatorOnboardingModal
        onComplete={() => {
          setShowOnboarding(false);
          if (data) setData({ ...data, onboardingCompleted: true });
        }}
      />
    )}
    <div className="space-y-6 max-w-6xl">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-slate-100">
            Bonjour, {firstName} 👋
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            {new Date().toLocaleDateString("fr-MA", { weekday: "long", day: "numeric", month: "long" })}
            {" · "}
            <span className={cn("font-medium bg-gradient-to-r bg-clip-text text-transparent", gradient)}>{level}</span>
          </p>
        </div>
        <Link
          href="/dashboard/creator/challenges"
          className="hidden sm:flex items-center gap-2 px-5 py-3 rounded-[12px] bg-gradient-to-r from-indigo-500 to-pink-500 text-white text-sm font-semibold hover:from-indigo-600 hover:to-pink-600 transition-all hover:scale-[1.02] shadow-lg shadow-indigo-500/20"
        >
          <Flame size={15} />
          Voir les défis
        </Link>
      </div>

      {/* ── Onboarding card (shown only for new creators) ── */}
      {isNewCreator && (
        <div className="glass rounded-[20px] p-6 border border-indigo-500/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-pink-500/5" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={16} className="text-indigo-400" />
              <span className="text-sm font-semibold text-indigo-300">Par où commencer ?</span>
            </div>
            <p className="text-xs text-slate-600 mb-5">Suis ces 4 étapes pour démarrer sur Mafluencer</p>

            {/* Progress bar */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-pink-500 rounded-full transition-all duration-700"
                  style={{ width: `${completionPct}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-indigo-400 flex-shrink-0">{completionPct}%</span>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              {onboardingSteps.map((step, i) => {
                const Icon = step.icon;
                return (
                  <Link key={i} href={step.href}>
                    <div className={cn(
                      "flex items-center gap-3 p-3 rounded-[12px] border transition-all group",
                      step.done
                        ? "bg-emerald-500/5 border-emerald-500/20 opacity-70"
                        : "bg-white/[0.03] border-white/[0.08] hover:border-indigo-500/30 hover:bg-indigo-500/5 cursor-pointer"
                    )}>
                      <div className={cn(
                        "w-8 h-8 rounded-[8px] flex items-center justify-center flex-shrink-0",
                        step.done ? "bg-emerald-500/15" : "bg-indigo-500/15"
                      )}>
                        {step.done
                          ? <CheckCircle size={15} className="text-emerald-400" />
                          : <Icon size={15} className="text-indigo-400" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-xs font-semibold", step.done ? "text-slate-500 line-through" : "text-slate-200")}>
                          Étape {i + 1} — {step.label}
                        </p>
                        <p className="text-[11px] text-slate-600 truncate">{step.sublabel}</p>
                      </div>
                      {!step.done && (
                        <ArrowRight size={13} className="text-slate-600 group-hover:text-indigo-400 transition-colors flex-shrink-0" />
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>

            {nextStep && (
              <Link href={nextStep.href}>
                <button className="mt-4 w-full py-3 rounded-[12px] bg-gradient-to-r from-indigo-500 to-pink-500 text-white text-sm font-semibold hover:from-indigo-600 hover:to-pink-600 transition-all hover:scale-[1.01] shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2">
                  <ArrowRight size={15} />
                  Continuer : {nextStep.label}
                </button>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Score card */}
        <div className="col-span-2 lg:col-span-1 glass rounded-[16px] p-5 flex items-center gap-4 relative overflow-hidden group hover:scale-[1.02] transition-all duration-200">
          <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-[0.06] group-hover:opacity-[0.1] transition-opacity`} />
          <ScoreRing score={score} size={80} strokeWidth={6} />
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Ton score</p>
            <div className={cn("text-xs font-bold bg-gradient-to-r bg-clip-text text-transparent", gradient)}>
              {level}
            </div>
            <p className="text-[11px] text-slate-600 mt-0.5">{score} points</p>
          </div>
        </div>

        <StatCard
          label="Défis complétés"
          value={data?.challengesCompleted ?? 0}
          icon={Trophy}
          iconColor="text-amber-400"
          sub={data?.challengesCompleted === 0 ? "Lance-toi !" : "Continue comme ça !"}
        />
        <StatCard
          label="Revenus ce mois"
          value={formatMAD(data?.earningsThisMonth ?? 0)}
          icon={Wallet}
          iconColor="text-emerald-400"
          sub={data?.earningsThisMonth === 0 ? "Les missions arrivent 💪" : "Ce mois-ci"}
        />
        <StatCard
          label="Missions reçues"
          value={data?.pendingMissions ?? 0}
          icon={Briefcase}
          iconColor="text-pink-400"
          sub={(data?.pendingMissions ?? 0) > 0 ? "Réponds vite !" : "Aucune en attente"}
        />
      </div>

      {/* ── Profile completion bar (shown for incomplete profiles) ── */}
      {data && completionPct < 100 && !isNewCreator && (
        <div className="glass rounded-[16px] p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-300">Profil complété à</span>
            <Link href="/dashboard/creator/profile" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
              Compléter →
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-pink-500 rounded-full transition-all duration-700"
                style={{ width: `${completionPct}%` }}
              />
            </div>
            <span className="text-sm font-bold text-indigo-400">{completionPct}%</span>
          </div>
          <p className="text-xs text-slate-600 mt-2">
            Un profil complet attire 3x plus de missions des marques
          </p>
        </div>
      )}

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
              {data?.activeChallenge && <Badge variant="warning">En cours</Badge>}
            </div>

            {data?.activeChallenge ? (
              <>
                <h3 className="text-xl font-heading font-bold text-slate-100 mb-1">
                  {data.activeChallenge.title}
                </h3>
                <p className="text-xs text-slate-500 mb-5">
                  {formatNumber(data.activeChallenge.submissionCount)} participants · {data.activeChallenge.category}
                </p>
                <div className="mb-6">
                  <p className="text-xs text-slate-600 mb-2 flex items-center gap-1">
                    <Clock size={11} /> Temps restant pour participer
                  </p>
                  <CountdownTimer endDate={data.activeChallenge.endDate} size="md" />
                </div>
                <Link
                  href={`/dashboard/creator/challenge/${data.activeChallenge.id}`}
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-[12px] bg-gradient-to-r from-orange-500 to-pink-500 text-white text-sm font-semibold hover:from-orange-600 hover:to-pink-600 transition-all hover:scale-[1.01] shadow-lg shadow-orange-500/20"
                >
                  Participer maintenant
                  <ArrowRight size={15} />
                </Link>
              </>
            ) : (
              <div className="py-8 text-center">
                <p className="text-3xl mb-3">🎯</p>
                <p className="text-slate-400 font-medium text-sm">Pas de défi en ce moment</p>
                <p className="text-slate-600 text-xs mt-1 mb-5">On prépare quelque chose pour toi — reviens bientôt !</p>
                <Link
                  href="/dashboard/creator/challenges"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[12px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-sm font-medium hover:bg-indigo-500/30 transition-all"
                >
                  Voir l&apos;historique des défis
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Score progression */}
        <div className="glass rounded-[20px] p-6">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp size={16} className="text-indigo-400" />
            <span className="text-sm font-semibold text-slate-300">Ta progression</span>
          </div>
          <div className="space-y-4">
            <div className="text-center py-4">
              <p className="text-4xl font-heading font-bold text-slate-100">{score}</p>
              <p className="text-xs text-slate-500 mt-1">points au total</p>
            </div>
            {level !== "Legend" && (() => {
              const thresholds: Record<string, [number, number]> = {
                Rookie: [0, 200], Rising: [200, 400], Star: [400, 600], Elite: [600, 800],
              };
              const levelLabels: Record<string, string> = {
                Rookie: "Débutant", Rising: "En route", Star: "Star", Elite: "Élite",
              };
              const [min, max] = thresholds[level] ?? [0, 1000];
              const pct = ((score - min) / (max - min)) * 100;
              const nextLevel = level === "Rookie" ? "Rising" : level === "Rising" ? "Star" : level === "Star" ? "Elite" : "Legend";
              const pointsLeft = max - score;
              return (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>{levelLabels[level] ?? level}</span>
                    <span>{levelLabels[nextLevel] ?? nextLevel}</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${gradient} rounded-full transition-all duration-700`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-center text-slate-600">
                    Encore <span className="text-indigo-400 font-semibold">+{pointsLeft} pts</span> pour passer au niveau supérieur
                  </p>
                  <div className="mt-3 p-3 rounded-[10px] bg-indigo-500/5 border border-indigo-500/10">
                    <p className="text-[11px] text-slate-500 text-center">
                      💡 Participe à un défi pour gagner des points
                    </p>
                  </div>
                </div>
              );
            })()}
            {level === "Legend" && (
              <div className="text-center py-2">
                <p className="text-2xl">👑</p>
                <p className="text-xs text-amber-400 font-semibold mt-1">Niveau maximum atteint !</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Missions reçues ── */}
      <div className="glass rounded-[20px] p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Briefcase size={16} className="text-pink-400" />
            <span className="text-sm font-semibold text-slate-300">Missions des marques</span>
          </div>
          <Link href="/dashboard/creator/missions" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1">
            Tout voir <ChevronRight size={12} />
          </Link>
        </div>

        {(data?.recentMissions ?? []).length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-3xl mb-3">📭</p>
            <p className="text-slate-400 font-medium text-sm">Aucune mission reçue pour l&apos;instant</p>
            <p className="text-slate-600 text-xs mt-2 mb-5 max-w-xs mx-auto">
              Les marques t&apos;enverront des missions une fois ton profil vérifié et ton score visible
            </p>
            <Link
              href="/dashboard/creator/profile"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[12px] bg-gradient-to-r from-indigo-500 to-pink-500 text-white text-sm font-semibold hover:from-indigo-600 hover:to-pink-600 transition-all"
            >
              Compléter mon profil
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {(data?.recentMissions ?? []).map((m) => {
              const statusMeta = MISSION_STATUS_LABELS[m.status] ?? { label: m.status, variant: "default" as const };
              return (
                <Link key={m.id} href="/dashboard/creator/missions">
                  <div className="flex items-center gap-3 p-3.5 rounded-[12px] hover:bg-white/5 transition-colors group border border-transparent hover:border-white/[0.06]">
                    <div className="w-10 h-10 rounded-[10px] bg-amber-500/10 flex items-center justify-center flex-shrink-0 text-lg">
                      🏢
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors truncate">
                        {m.brand}
                      </p>
                      <p className="text-xs text-slate-600">{MISSION_TYPE_LABELS[m.type] ?? m.type} · {formatMAD(m.budget)}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge variant={statusMeta.variant}>{statusMeta.label}</Badge>
                      <ChevronRight size={13} className="text-slate-700 group-hover:text-slate-400 transition-colors" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Mobile CTA button */}
      <div className="sm:hidden">
        <Link
          href="/dashboard/creator/challenges"
          className="flex items-center justify-center gap-2 w-full py-4 rounded-[14px] bg-gradient-to-r from-indigo-500 to-pink-500 text-white text-base font-semibold hover:from-indigo-600 hover:to-pink-600 transition-all shadow-lg shadow-indigo-500/20"
        >
          <Flame size={18} />
          Voir les défis disponibles
        </Link>
      </div>
    </div>
    </>
  );
}
