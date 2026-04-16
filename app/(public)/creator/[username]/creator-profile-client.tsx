"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MapPin,
  TrendingUp,
  Award,
  Flame,
  Play,
  Star,
  Eye,
  MessageCircle,
  ArrowRight,
  Share2,
  Check,
} from "lucide-react";
import Avatar from "@/components/ui/avatar";
import Badge from "@/components/ui/badge";
import ScoreRing from "@/components/ui/score-ring";
import ScrollReveal from "@/components/ui/scroll-reveal";
import { cn, formatMAD, formatNumber, getLevelGradient, getScoreLevel } from "@/lib/utils";

type PortfolioItem = { id: string; thumbnail: null | string; views: number; title: string };
type Review = { brand: string; rating: number; text: string; avatar: string };
type ChallengeItem = { id: string; title: string; date: string; rank: number; score: number };
type CreatorData = {
  username: string; name: string; city: string; bio: string;
  niches: string[]; score: number; followersCount: number; engagementRate: number;
  tiktokHandle: string; instagramHandle: string; challengesCount: number; missionsCount: number;
  pricePerPost: number; pricePerVideo: number; portfolio: PortfolioItem[];
  reviews: Review[]; challenges: ChallengeItem[];
};

const TABS = ["Portfolio", "Défis", "Avis"] as const;
type Tab = typeof TABS[number];

const RANK_MEDALS = ["🥇", "🥈", "🥉"];

export default function CreatorProfileClient({ creator }: { creator: CreatorData }) {
  const [tab, setTab] = useState<Tab>("Portfolio");
  const [copied, setCopied] = useState(false);

  const level = getScoreLevel(creator.score);
  const gradient = getLevelGradient(level);

  const avgRating = creator.reviews.length > 0
    ? creator.reviews.reduce((a, r) => a + r.rating, 0) / creator.reviews.length
    : 0;

  function handleShare() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen">
      {/* ===== Hero Banner ===== */}
      <div className="relative h-52 sm:h-64 overflow-hidden">
        {/* Gradient banner */}
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-30`} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0F172A]" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* ===== Profile header ===== */}
      <div className="max-w-5xl mx-auto px-4 -mt-16 relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5 mb-6">
          {/* Avatar */}
          <div className="relative">
            <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${gradient} blur-md opacity-60`} />
            <div className="relative w-28 h-28 rounded-full border-4 border-[#0F172A] overflow-hidden bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center shadow-2xl">
              <Avatar name={creator.name} size="xl" className="w-full h-full rounded-full" />
            </div>
          </div>

          <div className="flex-1 pb-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 className="text-2xl sm:text-3xl font-heading font-bold text-slate-100">{creator.name}</h1>
              <div className={`px-2.5 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${gradient} text-white`}>
                {level}
              </div>
            </div>
            <p className="text-slate-500 text-sm">@{creator.username}</p>
            <div className="flex items-center gap-4 mt-2 flex-wrap">
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <MapPin size={11} /> {creator.city}
              </span>
              {creator.niches.map((n) => (
                <Badge key={n} variant="primary" className="text-[10px]">{n}</Badge>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pb-1">
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-[12px] glass border border-white/10 text-slate-400 text-sm hover:text-slate-200 hover:border-white/20 transition-all"
            >
              {copied ? <Check size={15} className="text-emerald-400" /> : <Share2 size={15} />}
              {copied ? "Copié !" : "Partager"}
            </button>
            <Link
              href="/auth/register"
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-[12px] bg-gradient-to-r from-indigo-500 to-pink-500 text-white text-sm font-medium hover:from-indigo-600 hover:to-pink-600 transition-all hover:scale-[1.02] shadow-lg shadow-indigo-500/20"
            >
              Contacter
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>

        {/* Bio */}
        <p className="text-slate-400 text-sm leading-relaxed mb-8 max-w-2xl">
          {creator.bio}
        </p>

        {/* Stats + Score row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
          {/* Score ring */}
          <div className="col-span-2 md:col-span-1 glass rounded-[16px] p-4 flex items-center justify-center">
            <ScoreRing score={creator.score} size={100} />
          </div>

          {[
            { label: "Abonnés", value: formatNumber(creator.followersCount), icon: "👥" },
            { label: "Engagement", value: `${creator.engagementRate}%`, icon: "📊", green: true },
            { label: "Défis", value: creator.challengesCount.toString(), icon: "🏆" },
            { label: "Missions", value: creator.missionsCount.toString(), icon: "💼" },
          ].map(({ label, value, icon, green }) => (
            <div key={label} className="glass rounded-[16px] p-4 text-center">
              <p className="text-xl mb-1">{icon}</p>
              <p className={cn("text-xl font-heading font-bold", green ? "text-emerald-400" : "text-slate-100")}>
                {value}
              </p>
              <p className="text-xs text-slate-600 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Pricing strip */}
        <ScrollReveal>
          <div className="glass rounded-[16px] p-5 mb-10 flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <Award size={16} className="text-indigo-400" />
              <span className="text-sm font-medium text-slate-300">Tarifs missions</span>
            </div>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Post :</span>
                <span className="text-sm font-semibold text-slate-200">{formatMAD(creator.pricePerPost)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Vidéo :</span>
                <span className="text-sm font-semibold text-slate-200">{formatMAD(creator.pricePerVideo)}</span>
              </div>
            </div>
            <div className="ml-auto">
              <Link
                href="/auth/register"
                className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
              >
                Envoyer une offre <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        </ScrollReveal>

        {/* Socials */}
        <div className="flex gap-3 mb-10">
          <a
            href={`https://tiktok.com/@${creator.tiktokHandle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 glass rounded-[12px] text-sm text-slate-400 hover:text-slate-200 hover:border-white/20 transition-all border border-white/8"
          >
            <span className="text-base">🎵</span>
            @{creator.tiktokHandle}
          </a>
          <a
            href={`https://instagram.com/${creator.instagramHandle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 glass rounded-[12px] text-sm text-slate-400 hover:text-slate-200 hover:border-white/20 transition-all border border-white/8"
          >
            <span className="text-base">📸</span>
            @{creator.instagramHandle}
          </a>
        </div>

        {/* ===== TABS ===== */}
        <div className="flex gap-1 mb-8 p-1 glass rounded-[14px] w-fit">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "px-5 py-2.5 rounded-[10px] text-sm font-medium transition-all duration-200",
                tab === t
                  ? "bg-indigo-500/20 text-indigo-300"
                  : "text-slate-500 hover:text-slate-300"
              )}
            >
              {t}
              {t === "Avis" && creator.reviews.length > 0 && (
                <span className="ml-1.5 text-xs text-slate-600">({creator.reviews.length})</span>
              )}
            </button>
          ))}
        </div>

        {/* ===== Portfolio ===== */}
        {tab === "Portfolio" && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
            {creator.portfolio.map((item, i) => (
              <ScrollReveal key={item.id} delay={i * 60}>
                <div className="group relative glass rounded-[14px] overflow-hidden aspect-[9/16] max-h-72 hover:scale-[1.02] transition-all duration-300">
                  {/* Placeholder video thumb */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-20`} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/20 transition-all">
                      <Play size={20} className="text-white fill-white" />
                    </div>
                  </div>
                  {/* Overlay */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                    <p className="text-white text-xs font-medium truncate">{item.title}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                      <Eye size={10} />
                      {formatNumber(item.views)} vues
                    </div>
                  </div>
                  {/* Rank badge */}
                  {i < 3 && (
                    <div className="absolute top-2 left-2 text-lg">{RANK_MEDALS[i]}</div>
                  )}
                </div>
              </ScrollReveal>
            ))}
          </div>
        )}

        {/* ===== Défis ===== */}
        {tab === "Défis" && (
          <div className="space-y-3 mb-12">
            {creator.challenges.map((ch, i) => (
              <ScrollReveal key={ch.id} delay={i * 60}>
                <div className="glass rounded-[14px] p-5 flex items-center gap-4 hover:scale-[1.01] transition-all group">
                  <div className="text-2xl flex-shrink-0">
                    {ch.rank === 1 ? "🥇" : ch.rank === 2 ? "🥈" : ch.rank === 3 ? "🥉" : `#${ch.rank}`}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-200 text-sm group-hover:text-white transition-colors truncate">{ch.title}</p>
                    <p className="text-xs text-slate-600 mt-0.5">{ch.date}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-slate-200">{ch.score} pts</p>
                    <div className="flex items-center gap-1 justify-end mt-0.5">
                      <Flame size={10} className="text-orange-400" />
                      <p className="text-xs text-slate-600">Score</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        )}

        {/* ===== Avis ===== */}
        {tab === "Avis" && (
          <div className="space-y-4 mb-12">
            {/* Average */}
            <div className="glass rounded-[16px] p-5 flex items-center gap-5 mb-6">
              <div className="text-center">
                <p className="text-4xl font-heading font-bold text-slate-100">{avgRating.toFixed(1)}</p>
                <div className="flex gap-0.5 justify-center mt-1">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} size={12} className={j < Math.round(avgRating) ? "text-amber-400 fill-amber-400" : "text-slate-700"} />
                  ))}
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-200">{creator.reviews.length} avis de brands</p>
                <p className="text-xs text-slate-500 mt-1">Basé sur les missions collaboratives</p>
              </div>
            </div>

            {creator.reviews.map((rev, i) => (
              <ScrollReveal key={i} delay={i * 80}>
                <div className="glass rounded-[14px] p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {rev.avatar}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-200">{rev.brand}</p>
                      <div className="flex gap-0.5 mt-0.5">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <Star key={j} size={11} className={j < rev.rating ? "text-amber-400 fill-amber-400" : "text-slate-700"} />
                        ))}
                      </div>
                    </div>
                    <MessageCircle size={14} className="text-slate-700" />
                  </div>
                  <p className="text-slate-500 text-sm leading-relaxed">&ldquo;{rev.text}&rdquo;</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        )}

        {/* ===== CTA bas de page ===== */}
        <ScrollReveal>
          <div className="glass rounded-[20px] p-8 text-center mb-12 relative overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5`} />
            <div className="relative z-10">
              <p className="text-2xl mb-3">🤝</p>
              <h3 className="font-heading font-bold text-slate-100 text-xl mb-2">
                Collaborer avec {creator.name.split(" ")[0]} ?
              </h3>
              <p className="text-slate-500 text-sm mb-5">
                Crée un compte Brand pour envoyer une mission directement.
              </p>
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-[12px] bg-gradient-to-r from-indigo-500 to-pink-500 text-white text-sm font-semibold hover:from-indigo-600 hover:to-pink-600 transition-all hover:scale-[1.02] shadow-lg shadow-indigo-500/20"
              >
                Créer un compte Brand
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
