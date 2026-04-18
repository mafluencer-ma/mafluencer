"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Search, MapPin, Tag, Star, Briefcase,
  Users, X, ExternalLink, RefreshCw,
} from "lucide-react";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import PageHeader from "@/components/dashboard/page-header";
import EmptyState from "@/components/dashboard/empty-state";
import { cn, formatNumber, getScoreLevel } from "@/lib/utils";

const CITIES  = ["Toutes", "Casablanca", "Rabat", "Marrakech", "Tanger", "Fès", "Agadir"];
const NICHES  = ["Toutes", "Food", "Beauté", "Humour", "Lifestyle", "Tech", "Sport", "Mode", "Gaming"];
const LEVELS  = ["Tous", "Rookie", "Rising", "Star", "Elite", "Legend"];

type Creator = {
  id:             string;
  name:           string;
  city:           string | null;
  niches:         string[];
  score:          number;
  level:          string;
  followersCount: number;
  engagementRate: number;
  pricePerPost:   number | null;
};

const LEVEL_GRADIENTS: Record<string, string> = {
  Rookie: "from-slate-500 to-slate-400",
  Rising: "from-emerald-500 to-teal-400",
  Star:   "from-blue-500 to-indigo-400",
  Elite:  "from-indigo-500 to-violet-400",
  Legend: "from-amber-500 to-orange-400",
};

export default function BrandDiscoverContent() {
  const [search, setSearch] = useState("");
  const [city,   setCity]   = useState("Toutes");
  const [niche,  setNiche]  = useState("Toutes");
  const [level,  setLevel]  = useState("Tous");

  const [creators, setCreators] = useState<Creator[]>([]);
  const [total,    setTotal]    = useState(0);
  const [loading,  setLoading]  = useState(true);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "30" });
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (city  !== "Toutes") params.set("city",  city);
      if (niche !== "Toutes") params.set("niche", niche);
      if (level !== "Tous")   params.set("level", level);

      const res  = await fetch(`/api/creators?${params}`);
      const data = res.ok ? await res.json() : null;

      setCreators((data?.creators ?? []).map((c: Record<string, unknown>) => ({
        id:             c.id,
        name:           c.name ?? "Creator",
        city:           c.city ?? null,
        niches:         (c.niches as string[]) ?? [],
        score:          (c.score as number) ?? 0,
        level:          (c.level as string) ?? "Rookie",
        followersCount: (c.followersCount as number) ?? 0,
        engagementRate: (c.engagementRate as number) ?? 0,
        pricePerPost:   (c.pricePerPost as number | null) ?? null,
      })));
      setTotal(data?.pagination?.total ?? 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, city, niche, level]);

  useEffect(() => { load(); }, [load]);

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
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom..."
            className="w-full bg-slate-800/60 border border-white/[0.08] rounded-[12px] pl-10 pr-4 py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
              <X size={14} />
            </button>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-600 flex items-center gap-1 mr-1"><MapPin size={11} /> Ville</span>
            {CITIES.map((c) => (
              <button key={c} onClick={() => setCity(c)} className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                city === c ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30" : "bg-slate-800/60 text-slate-500 border border-white/[0.08] hover:text-slate-300"
              )}>{c}</button>
            ))}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-600 flex items-center gap-1 mr-1"><Tag size={11} /> Niche</span>
            {NICHES.map((n) => (
              <button key={n} onClick={() => setNiche(n)} className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                niche === n ? "bg-pink-500/20 text-pink-300 border border-pink-500/30" : "bg-slate-800/60 text-slate-500 border border-white/[0.08] hover:text-slate-300"
              )}>{n}</button>
            ))}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-600 flex items-center gap-1 mr-1"><Star size={11} /> Niveau</span>
            {LEVELS.map((l) => (
              <button key={l} onClick={() => setLevel(l)} className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                level === l ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "bg-slate-800/60 text-slate-500 border border-white/[0.08] hover:text-slate-300"
              )}>{l}</button>
            ))}
          </div>
        </div>

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
          <span className="text-slate-300 font-semibold">{loading ? "…" : creators.length}</span> creator{creators.length !== 1 ? "s" : ""} affiché{creators.length !== 1 ? "s" : ""}
          {total > creators.length && <span className="text-slate-600"> sur {total}</span>}
        </p>
        <button onClick={load} disabled={loading} className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-400 transition-colors">
          <RefreshCw size={11} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Creator grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass rounded-[18px] p-5 animate-pulse">
              <div className="h-11 w-11 rounded-full bg-slate-700/60 mb-4" />
              <div className="h-3 bg-slate-700/60 rounded w-32 mb-2" />
              <div className="h-2.5 bg-slate-700/40 rounded w-full mb-4" />
              <div className="grid grid-cols-3 gap-2">
                {Array.from({ length: 3 }).map((__, j) => (
                  <div key={j} className="h-8 bg-slate-700/40 rounded" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : creators.length === 0 ? (
        <EmptyState emoji="🔍" title="Aucun creator trouvé" description="Essaie d'élargir tes filtres" />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {creators.map((c, i) => {
            const grad = LEVEL_GRADIENTS[c.level] ?? "from-indigo-500 to-pink-500";
            return (
              <div key={c.id} className="glass rounded-[18px] overflow-hidden hover:scale-[1.01] transition-transform duration-200 group">
                <div className={`h-1.5 bg-gradient-to-r ${grad}`} />
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
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
                        <p className="text-sm font-semibold text-slate-200">{c.name}</p>
                        {c.city && <p className="text-xs text-slate-600">{c.city}</p>}
                      </div>
                    </div>
                    <Badge variant="default">{c.level}</Badge>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="text-center">
                      <p className="text-sm font-bold text-slate-200">{formatNumber(c.followersCount)}</p>
                      <p className="text-[10px] text-slate-600">Abonnés</p>
                    </div>
                    <div className="text-center border-x border-white/[0.08]">
                      <p className="text-sm font-bold text-emerald-400">{c.engagementRate}%</p>
                      <p className="text-[10px] text-slate-600">Engagement</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-indigo-300">{c.score}</p>
                      <p className="text-[10px] text-slate-600">Score</p>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex items-center gap-2 mb-4 flex-wrap">
                    {c.niches.slice(0, 1).map((n) => (
                      <span key={n} className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400">{n}</span>
                    ))}
                    {c.pricePerPost != null && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                        dès {c.pricePerPost} MAD
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link href={`/creator/${c.id}`} className="flex-shrink-0">
                      <Button variant="ghost" size="sm"><ExternalLink size={12} /></Button>
                    </Link>
                    <Link href={`/dashboard/brand/missions/new?creator=${c.id}`} className="flex-1">
                      <Button variant="primary" size="sm" className="w-full">
                        <Briefcase size={12} /> Créer une mission
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
