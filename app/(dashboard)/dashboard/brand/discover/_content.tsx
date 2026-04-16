"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search, MapPin, Tag, Star, TrendingUp, Briefcase,
  Users, Filter, X, ExternalLink,
} from "lucide-react";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import PageHeader from "@/components/dashboard/page-header";
import EmptyState from "@/components/dashboard/empty-state";
import { cn, formatNumber, getScoreLevel, getLevelColor } from "@/lib/utils";

const CITIES  = ["Toutes", "Casablanca", "Rabat", "Marrakech", "Tanger", "Fès", "Agadir"];
const NICHES  = ["Toutes", "Food", "Beauté", "Humour", "Lifestyle", "Tech", "Sport", "Mode", "Gaming"];
const LEVELS  = ["Tous", "Rookie", "Rising", "Star", "Elite", "Legend"];

type Creator = {
  username: string; name: string; city: string; niche: string;
  score: number; followers: number; engagementRate: number;
  pricePost: number; bio: string; verified: boolean;
};

const CREATORS: Creator[] = [
  { username: "yassine_create",  name: "Yassine Chahir",  city: "Casablanca", niche: "Humour",    score: 847, followers: 124000, engagementRate: 8.2, pricePost: 1500, bio: "Creator humour & lifestyle 🎬", verified: true },
  { username: "sarabeauty",      name: "Sara Benali",     city: "Rabat",      niche: "Beauté",    score: 762, followers: 89000,  engagementRate: 9.1, pricePost: 1200, bio: "Beauté & soins naturels 💄",    verified: true },
  { username: "techmaroc",       name: "Karim TechMa",   city: "Casablanca", niche: "Tech",      score: 698, followers: 67000,  engagementRate: 6.8, pricePost: 900,  bio: "Tests et revues tech 🖥️",       verified: false },
  { username: "fatima_food",     name: "Fatima Zahra",   city: "Marrakech",  niche: "Food",      score: 634, followers: 55000,  engagementRate: 11.3, pricePost: 800, bio: "Cuisine marocaine authentique 🍲", verified: true },
  { username: "lifestyle_hind",  name: "Hind Moussaoui", city: "Casablanca", niche: "Lifestyle", score: 589, followers: 48000,  engagementRate: 7.5, pricePost: 700,  bio: "Lifestyle & voyages 🌍",         verified: false },
  { username: "sport_amine",     name: "Amine Fitness",  city: "Tanger",     niche: "Sport",     score: 521, followers: 42000,  engagementRate: 8.9, pricePost: 650,  bio: "Coach fitness & nutrition 💪",   verified: true },
  { username: "mode_rania",      name: "Rania El Fassi", city: "Fès",        niche: "Mode",      score: 445, followers: 31000,  engagementRate: 6.2, pricePost: 550,  bio: "Mode & tendances marocaines 👗", verified: false },
  { username: "gaming_driss",    name: "Driss Gamer",    city: "Agadir",     niche: "Gaming",    score: 389, followers: 27000,  engagementRate: 12.4, pricePost: 500, bio: "Streams & reviews gaming 🎮",    verified: false },
  { username: "food_said",       name: "Said Cuisine",   city: "Rabat",      niche: "Food",      score: 312, followers: 19000,  engagementRate: 9.8, pricePost: 400,  bio: "Street food & restaurants 🍕",   verified: false },
  { username: "beaute_nora",     name: "Nora Alami",     city: "Casablanca", niche: "Beauté",    score: 278, followers: 15000,  engagementRate: 10.1, pricePost: 350, bio: "Skincare & bien-être 🌸",        verified: false },
  { username: "humour_younes",   name: "Younes Comedy",  city: "Marrakech",  niche: "Humour",    score: 245, followers: 13000,  engagementRate: 7.7, pricePost: 300,  bio: "Sketches & skits 😂",            verified: false },
  { username: "travel_lina",     name: "Lina Voyages",   city: "Tanger",     niche: "Lifestyle", score: 198, followers: 9500,   engagementRate: 8.3, pricePost: 250,  bio: "Voyages & découvertes 🌍",       verified: false },
];

const LEVEL_GRADIENTS: Record<string, string> = {
  Rookie:  "from-slate-500 to-slate-400",
  Rising:  "from-emerald-500 to-teal-400",
  Star:    "from-blue-500 to-indigo-400",
  Elite:   "from-indigo-500 to-violet-400",
  Legend:  "from-amber-500 to-orange-400",
};

export default function BrandDiscoverContent() {
  const [search, setSearch]   = useState("");
  const [city, setCity]       = useState("Toutes");
  const [niche, setNiche]     = useState("Toutes");
  const [level, setLevel]     = useState("Tous");
  const [contactedId, setContactedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return CREATORS.filter((c) => {
      if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.username.toLowerCase().includes(search.toLowerCase())) return false;
      if (city !== "Toutes"  && c.city  !== city)  return false;
      if (niche !== "Toutes" && c.niche !== niche) return false;
      if (level !== "Tous"   && getScoreLevel(c.score) !== level) return false;
      return true;
    });
  }, [search, city, niche, level]);

  const activeFilters = [
    city  !== "Toutes" && { key: "city",  label: city },
    niche !== "Toutes" && { key: "niche", label: niche },
    level !== "Tous"   && { key: "level", label: level },
  ].filter(Boolean) as { key: string; label: string }[];

  function clearFilter(key: string) {
    if (key === "city")  setCity("Toutes");
    if (key === "niche") setNiche("Toutes");
    if (key === "level") setLevel("Tous");
  }

  return (
    <div className="max-w-5xl space-y-6">
      <PageHeader
        title="Découvrir des creators"
        subtitle="Filtre par ville, niche ou niveau et contacte les meilleurs profils"
        icon={Users}
      />

      {/* Search + filters */}
      <div className="glass rounded-[20px] p-5 space-y-4">
        {/* Search bar */}
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom ou @handle..."
            className="w-full bg-slate-800/60 border border-white/8 rounded-[12px] pl-10 pr-4 py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filter rows */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-600 flex items-center gap-1 mr-1"><MapPin size={11} /> Ville</span>
            {CITIES.map((c) => (
              <button key={c} onClick={() => setCity(c)} className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                city === c ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30" : "bg-slate-800/60 text-slate-500 border border-white/8 hover:text-slate-300"
              )}>{c}</button>
            ))}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-600 flex items-center gap-1 mr-1"><Tag size={11} /> Niche</span>
            {NICHES.map((n) => (
              <button key={n} onClick={() => setNiche(n)} className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                niche === n ? "bg-pink-500/20 text-pink-300 border border-pink-500/30" : "bg-slate-800/60 text-slate-500 border border-white/8 hover:text-slate-300"
              )}>{n}</button>
            ))}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-600 flex items-center gap-1 mr-1"><Star size={11} /> Niveau</span>
            {LEVELS.map((l) => (
              <button key={l} onClick={() => setLevel(l)} className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                level === l ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "bg-slate-800/60 text-slate-500 border border-white/8 hover:text-slate-300"
              )}>{l}</button>
            ))}
          </div>
        </div>

        {/* Active filter chips */}
        {activeFilters.length > 0 && (
          <div className="flex items-center gap-2 pt-1 flex-wrap">
            <span className="text-xs text-slate-600">Filtres actifs :</span>
            {activeFilters.map(({ key, label }) => (
              <button key={key} onClick={() => clearFilter(key)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400 transition-all">
                {label} <X size={10} />
              </button>
            ))}
            <button onClick={() => { setCity("Toutes"); setNiche("Toutes"); setLevel("Tous"); }}
              className="text-xs text-slate-600 hover:text-slate-400 transition-colors">
              Tout effacer
            </button>
          </div>
        )}
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-600">
          <span className="text-slate-300 font-semibold">{filtered.length}</span> creator{filtered.length !== 1 ? "s" : ""} trouvé{filtered.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Creator grid */}
      {filtered.length === 0 ? (
        <EmptyState
          emoji="🔍"
          title="Aucun creator trouvé"
          description="Essaie d'élargir tes filtres"
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c, i) => {
            const lvl = getScoreLevel(c.score);
            const grad = LEVEL_GRADIENTS[lvl] ?? "from-indigo-500 to-pink-500";
            const isContacted = contactedId === c.username;
            return (
              <div key={c.username} className="glass rounded-[18px] overflow-hidden hover:scale-[1.01] transition-transform duration-200 group">
                {/* Gradient strip */}
                <div className={`h-1.5 bg-gradient-to-r ${grad}`} />
                <div className="p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {/* Rank medal for top 3 */}
                      <div className="relative">
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-sm font-bold text-slate-200">
                          {c.name.slice(0, 2).toUpperCase()}
                        </div>
                        {i < 3 && (
                          <span className="absolute -top-1 -right-1 text-sm">
                            {i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1">
                          <p className="text-sm font-semibold text-slate-200">{c.name}</p>
                          {c.verified && <span className="text-indigo-400 text-xs">✓</span>}
                        </div>
                        <p className="text-xs text-slate-600">@{c.username}</p>
                      </div>
                    </div>
                    <Badge variant="default" className={`text-xs bg-gradient-to-r ${grad} bg-clip-text`}>
                      {lvl}
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-500 mb-4 line-clamp-2">{c.bio}</p>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="text-center">
                      <p className="text-sm font-bold text-slate-200">{formatNumber(c.followers)}</p>
                      <p className="text-[10px] text-slate-600">Abonnés</p>
                    </div>
                    <div className="text-center border-x border-white/8">
                      <p className="text-sm font-bold text-emerald-400">{c.engagementRate}%</p>
                      <p className="text-[10px] text-slate-600">Engagement</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-indigo-300">{c.score}</p>
                      <p className="text-[10px] text-slate-600">Score</p>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800/60 border border-white/8 text-slate-500">
                      <MapPin size={9} className="inline mr-0.5" />{c.city}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400">
                      {c.niche}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                      dès {c.pricePost} MAD
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link href={`/creator/${c.username}`} className="flex-shrink-0">
                      <Button variant="ghost" size="sm">
                        <ExternalLink size={12} />
                      </Button>
                    </Link>
                    <Link href={`/dashboard/brand/missions/new?creator=${c.username}`} className="flex-1">
                      <Button
                        variant={isContacted ? "secondary" : "primary"}
                        size="sm"
                        className="w-full"
                      >
                        <Briefcase size={12} />
                        {isContacted ? "Mission créée" : "Créer une mission"}
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
