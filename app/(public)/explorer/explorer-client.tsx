"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, MapPin, TrendingUp, Filter, X, Award, Flame } from "lucide-react";
import Avatar from "@/components/ui/avatar";
import Badge from "@/components/ui/badge";
import ScrollReveal from "@/components/ui/scroll-reveal";
import { cn, formatNumber, getLevelGradient, getScoreLevel } from "@/lib/utils";

// ——— Mock data (replaced by real DB later) ———
const MOCK_CREATORS = [
  { id: "1", username: "yassinecreates", name: "Yassine Benali", city: "Casablanca", niches: ["Humour", "Lifestyle"], score: 847, followersCount: 156000, engagementRate: 7.2, avatar: null, challengesCount: 24, missionsCount: 8 },
  { id: "2", username: "samia_beauty", name: "Samia Lahlou", city: "Rabat", niches: ["Beauté", "Lifestyle"], score: 712, followersCount: 89000, engagementRate: 9.1, avatar: null, challengesCount: 19, missionsCount: 5 },
  { id: "3", username: "karim.food", name: "Karim Idrissi", city: "Marrakech", niches: ["Food", "Lifestyle"], score: 634, followersCount: 210000, engagementRate: 5.4, avatar: null, challengesCount: 17, missionsCount: 6 },
  { id: "4", username: "tech_avec_amine", name: "Amine Khalil", city: "Casablanca", niches: ["Tech", "Lifestyle"], score: 589, followersCount: 45000, engagementRate: 11.3, avatar: null, challengesCount: 15, missionsCount: 3 },
  { id: "5", username: "sportbynawal", name: "Nawal Fassi", city: "Tanger", niches: ["Sport", "Lifestyle"], score: 521, followersCount: 67000, engagementRate: 8.6, avatar: null, challengesCount: 14, missionsCount: 4 },
  { id: "6", username: "zainab.mode", name: "Zainab Chraibi", city: "Fès", niches: ["Beauté", "Food"], score: 478, followersCount: 32000, engagementRate: 12.1, avatar: null, challengesCount: 12, missionsCount: 2 },
  { id: "7", username: "hassankitchen", name: "Hassan Tazi", city: "Agadir", niches: ["Food", "Humour"], score: 445, followersCount: 78000, engagementRate: 6.8, avatar: null, challengesCount: 11, missionsCount: 3 },
  { id: "8", username: "leila_tech", name: "Leila Benhaddou", city: "Casablanca", niches: ["Tech", "Beauté"], score: 398, followersCount: 24000, engagementRate: 13.5, avatar: null, challengesCount: 10, missionsCount: 1 },
  { id: "9", username: "omar_sport_dz", name: "Omar Guessous", city: "Rabat", niches: ["Sport", "Humour"], score: 367, followersCount: 53000, engagementRate: 7.9, avatar: null, challengesCount: 9, missionsCount: 2 },
  { id: "10", username: "rania.lifestyle", name: "Rania Amrani", city: "Marrakech", niches: ["Lifestyle", "Beauté"], score: 334, followersCount: 41000, engagementRate: 8.3, avatar: null, challengesCount: 8, missionsCount: 1 },
  { id: "11", username: "mehdi_humour", name: "Mehdi Ouadghiri", city: "Tanger", niches: ["Humour", "Sport"], score: 298, followersCount: 112000, engagementRate: 4.2, avatar: null, challengesCount: 7, missionsCount: 0 },
  { id: "12", username: "nora_food_ma", name: "Nora Benzekri", city: "Fès", niches: ["Food", "Lifestyle"], score: 245, followersCount: 18000, engagementRate: 10.7, avatar: null, challengesCount: 6, missionsCount: 0 },
];

const CITIES = ["Toutes", "Casablanca", "Rabat", "Marrakech", "Tanger", "Fès", "Agadir"];
const NICHES = ["Toutes", "Food", "Beauté", "Humour", "Lifestyle", "Tech", "Sport"];
const LEVELS = ["Tous", "Legend", "Elite", "Star", "Rising", "Rookie"];

const LEVEL_META: Record<string, { emoji: string; color: string }> = {
  Legend: { emoji: "👑", color: "text-yellow-400" },
  Elite: { emoji: "💎", color: "text-purple-400" },
  Star: { emoji: "⭐", color: "text-blue-400" },
  Rising: { emoji: "📈", color: "text-green-400" },
  Rookie: { emoji: "🌱", color: "text-slate-400" },
};

const RANK_MEDALS: Record<number, string> = { 0: "🥇", 1: "🥈", 2: "🥉" };

export default function ExplorerClient() {
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("Toutes");
  const [niche, setNiche] = useState("Toutes");
  const [level, setLevel] = useState("Tous");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    return MOCK_CREATORS.filter((c) => {
      if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.username.toLowerCase().includes(search.toLowerCase())) return false;
      if (city !== "Toutes" && c.city !== city) return false;
      if (niche !== "Toutes" && !c.niches.includes(niche)) return false;
      if (level !== "Tous" && getScoreLevel(c.score) !== level) return false;
      return true;
    });
  }, [search, city, niche, level]);

  const activeFilters = [
    city !== "Toutes" && city,
    niche !== "Toutes" && niche,
    level !== "Tous" && level,
  ].filter(Boolean) as string[];

  function clearAll() {
    setSearch("");
    setCity("Toutes");
    setNiche("Toutes");
    setLevel("Tous");
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="relative overflow-hidden pt-8 pb-12 px-4">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-600/10 rounded-full blur-3xl" />
        </div>
        <div className="max-w-5xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-indigo-500/20 text-indigo-300 text-xs font-medium mb-5">
            <Flame size={12} className="text-pink-400" />
            Classement mis à jour en temps réel
          </div>
          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-slate-100 mb-3">
            Explorer les <span className="gradient-text">creators</span>
          </h1>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            Découvre les meilleurs créateurs de contenu marocains classés par leur vrai score d&apos;engagement.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-20">
        {/* Search + Filter bar */}
        <div className="glass rounded-[16px] p-4 mb-6 space-y-3">
          <div className="flex gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Rechercher un creator..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-800/60 border border-white/8 rounded-[10px] pl-9 pr-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400">
                  <X size={14} />
                </button>
              )}
            </div>
            {/* Toggle filters */}
            <button
              onClick={() => setShowFilters((v) => !v)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-[10px] text-sm font-medium transition-all",
                showFilters ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30" : "bg-slate-800/60 text-slate-400 border border-white/8 hover:text-slate-200"
              )}
            >
              <Filter size={15} />
              Filtres
              {activeFilters.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-indigo-500 text-white text-xs flex items-center justify-center">
                  {activeFilters.length}
                </span>
              )}
            </button>
          </div>

          {/* Filter rows */}
          {showFilters && (
            <div className="space-y-3 pt-2 border-t border-white/8">
              {/* City */}
              <div>
                <p className="text-xs text-slate-600 mb-2 flex items-center gap-1.5">
                  <MapPin size={11} /> Ville
                </p>
                <div className="flex flex-wrap gap-2">
                  {CITIES.map((c) => (
                    <button
                      key={c}
                      onClick={() => setCity(c)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                        city === c
                          ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                          : "bg-slate-800/60 text-slate-500 border border-white/8 hover:text-slate-300"
                      )}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Niche */}
              <div>
                <p className="text-xs text-slate-600 mb-2 flex items-center gap-1.5">
                  <Flame size={11} /> Niche
                </p>
                <div className="flex flex-wrap gap-2">
                  {NICHES.map((n) => (
                    <button
                      key={n}
                      onClick={() => setNiche(n)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                        niche === n
                          ? "bg-pink-500/20 text-pink-300 border border-pink-500/30"
                          : "bg-slate-800/60 text-slate-500 border border-white/8 hover:text-slate-300"
                      )}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Level */}
              <div>
                <p className="text-xs text-slate-600 mb-2 flex items-center gap-1.5">
                  <Award size={11} /> Niveau
                </p>
                <div className="flex flex-wrap gap-2">
                  {LEVELS.map((l) => (
                    <button
                      key={l}
                      onClick={() => setLevel(l)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                        level === l
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          : "bg-slate-800/60 text-slate-500 border border-white/8 hover:text-slate-300"
                      )}
                    >
                      {l !== "Tous" && LEVEL_META[l]?.emoji} {l}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Active filters chips */}
          {activeFilters.length > 0 && (
            <div className="flex items-center gap-2 pt-1 flex-wrap">
              <span className="text-xs text-slate-600">Filtres actifs :</span>
              {activeFilters.map((f) => (
                <span key={f} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs">
                  {f}
                </span>
              ))}
              <button onClick={clearAll} className="text-xs text-slate-600 hover:text-slate-400 underline underline-offset-4 transition-colors">
                Tout effacer
              </button>
            </div>
          )}
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-slate-500">
            <span className="text-slate-300 font-medium">{filtered.length}</span> creator{filtered.length !== 1 && "s"} trouvé{filtered.length !== 1 && "s"}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <TrendingUp size={12} />
            Classé par score
          </div>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="glass rounded-[20px] py-20 text-center">
            <p className="text-3xl mb-3">🔍</p>
            <p className="text-slate-400 font-medium">Aucun creator trouvé</p>
            <p className="text-slate-600 text-sm mt-1">Essaie d&apos;autres filtres</p>
            <button onClick={clearAll} className="mt-4 text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
              Effacer les filtres
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((creator, idx) => {
              const lvl = getScoreLevel(creator.score);
              const meta = LEVEL_META[lvl];
              const gradClass = getLevelGradient(lvl);
              const isTop3 = idx < 3;

              return (
                <ScrollReveal key={creator.id} delay={Math.min(idx, 5) * 50}>
                  <Link href={`/creator/${creator.username}`}>
                    <div className={cn(
                      "glass rounded-[18px] p-5 hover:scale-[1.02] transition-all duration-200 group cursor-pointer relative overflow-hidden",
                      isTop3 && "border-indigo-500/20"
                    )}>
                      {/* Top 3 glow */}
                      {isTop3 && (
                        <div className={`absolute inset-0 bg-gradient-to-br ${gradClass} opacity-[0.04] group-hover:opacity-[0.07] transition-opacity`} />
                      )}

                      {/* Rank badge */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={creator.name} size="md" />
                          <div>
                            <p className="font-semibold text-slate-100 text-sm group-hover:text-white transition-colors">
                              {creator.name}
                            </p>
                            <p className="text-xs text-slate-600">@{creator.username}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {RANK_MEDALS[idx] && (
                            <span className="text-lg">{RANK_MEDALS[idx]}</span>
                          )}
                          <span className="text-xs font-bold text-slate-500">#{idx + 1}</span>
                        </div>
                      </div>

                      {/* Score bar */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm">{meta.emoji}</span>
                            <span className={cn("text-xs font-bold", meta.color)}>{lvl}</span>
                          </div>
                          <span className="text-sm font-heading font-bold text-slate-200">{creator.score} <span className="text-xs text-slate-600 font-normal">pts</span></span>
                        </div>
                        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${gradClass} rounded-full transition-all duration-500`}
                            style={{ width: `${(creator.score / 1000) * 100}%` }}
                          />
                        </div>
                      </div>

                      {/* Stats row */}
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        <div className="text-center">
                          <p className="text-sm font-semibold text-slate-200">{formatNumber(creator.followersCount)}</p>
                          <p className="text-[10px] text-slate-600">Abonnés</p>
                        </div>
                        <div className="text-center border-x border-white/5">
                          <p className="text-sm font-semibold text-emerald-400">{creator.engagementRate}%</p>
                          <p className="text-[10px] text-slate-600">Engagement</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-semibold text-slate-200">{creator.challengesCount}</p>
                          <p className="text-[10px] text-slate-600">Défis</p>
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="flex items-center justify-between">
                        <div className="flex gap-1.5 flex-wrap">
                          {creator.niches.slice(0, 2).map((n) => (
                            <Badge key={n} variant="primary" className="text-[10px] py-0.5">{n}</Badge>
                          ))}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-600">
                          <MapPin size={10} />
                          {creator.city}
                        </div>
                      </div>
                    </div>
                  </Link>
                </ScrollReveal>
              );
            })}
          </div>
        )}

        {/* Join CTA */}
        <ScrollReveal delay={100}>
          <div className="mt-12 glass rounded-[20px] p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-pink-500/5" />
            <div className="relative z-10">
              <p className="text-2xl mb-3">🏆</p>
              <h3 className="text-lg font-heading font-bold text-slate-100 mb-2">
                Tu veux figurer dans ce classement ?
              </h3>
              <p className="text-slate-500 text-sm mb-5">
                Rejoins Mafluencer, relève des défis et construis ton score.
              </p>
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-[12px] bg-gradient-to-r from-indigo-500 to-pink-500 text-white text-sm font-semibold hover:from-indigo-600 hover:to-pink-600 transition-all hover:scale-[1.02] shadow-lg shadow-indigo-500/20"
              >
                Créer mon profil
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
